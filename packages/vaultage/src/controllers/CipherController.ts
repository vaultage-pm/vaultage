import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { Inject } from 'typedi';
import { PushPullResponse, UpdateCipherRequest } from 'vaultage-protocol';

import { AuthenticationError } from '../storage/AuthenticationError';
import { DatabaseWithAuth } from '../storage/Database';
import { NotFastForwardError } from '../storage/NotFastForwardError';

/**
 * This CipherController provides the API methods "pull" and "push".
 * It is meant to be registered on an existing Express server via the VaultageServer class.
 */
@JsonController()
export class CipherController {

    @Inject()
    private db: DatabaseWithAuth;

    @Get('/:user/:key/vaultage_api')
    public async pull(
        @Param('user') username: string,
        @Param('key') password: string)
        : Promise<PushPullResponse> {

        try {
            const repo = await this.db.auth({
                username,
                password
            });

            const data = await repo.load();

            return {
                error: false,
                data: data
            };
        } catch (err) {
            return this.wrapError(err);
        }
    }

    @Post('/:user/:key/vaultage_api')
    public async push(
        @Body() request: UpdateCipherRequest,
        @Param('user') username: string,
        @Param('key') password: string)
        : Promise<PushPullResponse> {

        try {
            const dbAccess = await this.db.auth({
                username,
                password
            });

            const data = await dbAccess.save(request);

            return {
                error: false,
                data: data
            };
        } catch (err) {
            return this.wrapError(err);
        }
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
        } /* istanbul ignore next */ else {
            throw e; // Internal errors are not part of the protocol and thus will generate 500 status codes.
        }
    }
}
