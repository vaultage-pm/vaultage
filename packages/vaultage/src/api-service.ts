import { injectable, inject } from 'tsyringe';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { EXPRESS_SERVER_POST_LIMIT } from './constants';
import { api, PushPullResponse, VaultageConfig } from 'vaultage-protocol';
import { buildRouter } from 'rest-ts-express';
import { DemoModeError } from './storage/DemoModeError';
import { NotFastForwardError } from './storage/NotFastForwardError';
import { AuthenticationError } from './storage/AuthenticationError';
import { DatabaseWithAuth } from './storage/Database';

export const CONFIG_TOKEN = Symbol('config');
export const DB_TOKEN = Symbol('database');

@injectable()
export class ApiService {

    constructor(
            @inject(CONFIG_TOKEN) private readonly config: VaultageConfig,
            @inject(DB_TOKEN) private readonly db: DatabaseWithAuth
    ) { }

    /**
     * Creates an express server serving the Vaultage API (used to save and retreive the encrypted passwords).
     *
     * This gives you an express server which you can bind to a tcp port or test offline using supertest.
     */
    createVaultageAPIServer(): express.Application {
        const expressServer = express();

        // Allow requests from all origins.
        // We can do this because we don't have actual sessions and there is nothing more to be obtained
        // from the server if an attacker initiates a request from the victim's browser as opposed to if he initiates
        // it from anywhere else
        expressServer.use(cors());

        // I/O protocol is JSON based
        // Increase the limit of POST queries (needed as the database grows quite large)
        expressServer.use(json({limit: EXPRESS_SERVER_POST_LIMIT}));

        expressServer.use((_, res, next) => {

            // Enable access from any application
            res.setHeader('Access-Control-Allow-Origin', '*');

            // disables caching
            res.setHeader('Cache-Control', 'no-cache,no-store,max-age=0,must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '-1');

            // enables built-in XSS protection
            res.setHeader('X-XSS-Protection', '1;mode=block');

            // prevents Vaultage from being embedded in another website
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');

            // only allows javascript sources specified here
            // 'unsafe-inline' could be a threat if content was generated based on a URL (either client- or server-side)
            // which is not the case of this application.
            res.setHeader('Content-Security-Policy', 'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'');

            // prevents MIME-confusion attacks
            res.setHeader('X-Content-Type-Options', 'nosniff');

            next();
        });

        // Bind API to server
        expressServer.use(this.buildAPI());

        // We don't actually start the server yet. It is left to the caller to decide what to
        // do with this server.
        return expressServer;
    }

    private buildAPI() {
        return buildRouter(api, _ => _
                .pullConfig(() => {
                    return this.config;
                })
                .pullCipher(async req => {
                    try {
                        const dbAccess = await this.db.auth({
                            username: req.params.username,
                            password: req.params.remoteKey
                        });
                        const data = await dbAccess.load();

                        return {
                            error: false as false,
                            data: data
                        };
                    } catch (err) {
                        return this.wrapError(err);
                    }
                })
                .pushCipher(async req => {
                    try {
                        if (this.config.demo) {
                            throw new DemoModeError();
                        }

                        const dbAccess = await this.db.auth({
                            username: req.params.username,
                            password: req.params.remoteKey
                        });
                        const data = await dbAccess.save(req.body);

                        return {
                            error: false as false,
                            data: data
                        };
                    } catch (err) {
                        return this.wrapError(err);
                    }
                })
            );
    }

    private wrapError(e: Error): PushPullResponse {
        if (e instanceof NotFastForwardError) {
            return {
                error: true,
                description: 'Not fast forward',
                code: 'EFAST'
            };
        } else if (e instanceof AuthenticationError) {
            return {
                error: true,
                description: 'Authentication error',
                code: 'EAUTH'
            };
        } else if (e instanceof DemoModeError) {
            return {
                error: true,
                description: 'Server in demo mode',
                code: 'EDEMO'
            };
        } /* istanbul ignore next */ else {
            throw e; // Internal errors are not part of the protocol and thus will generate 500 status codes.
        }
    }
}