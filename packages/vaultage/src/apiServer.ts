import { json } from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import { useExpressServer } from 'routing-controllers';

/**
 * Creates an express server serving the Vaultage API (used to save and retreive the encrypted passwords).
 *
 * This gives you an express server which you can bind to a tcp port or test offline using supertest.
 */
export function createVaultageAPIServer(): express.Application {
    const expressServer = express();

    // Allow requests from all origins.
    // We can do this because we don't have actual sessions and there is nothing more to be obtained
    // from the server if an attacker initiates a request from the victim's browser as opposed to if he initiates
    // it from anywhere else
    expressServer.use(cors());

    // I/O protocol is JSON based
    expressServer.use(json());

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
        res.setHeader('Content-Security-Policy', 'script-src \'self\' \'unsafe-inline\'');

        // prevents MIME-confusion attacks
        res.setHeader('X-Content-Type-Options', 'nosniff');

        next();
      });

    // Bind API to server
    useExpressServer(expressServer, {
        controllers: [
            path.join(__dirname, 'controllers/**/*.js'),
            path.join(__dirname, 'controllers/**/*.ts'),
        ],
    });

    // We don't actually start the server yet. It is left to the caller to decide what to
    // do with this server.
    return expressServer;
}
