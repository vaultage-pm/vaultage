import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { Inject } from 'typedi';

import { IPushPullResponse } from '../messages/PullResponse';
import { UpdateCipherRequest } from '../messages/UpdateCipherRequest';
import { DatabaseWithAuth } from '../storage/Database';

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
        : Promise<IPushPullResponse> {

        try {
            const repo = await this.db.auth({
                username,
                password
            });

            const data = await repo.load();

            return {
                error: false,
                description: '',
                data: data
            };
        } catch (err) {
            return {
                error: true,
                description: ('' + err),
                data: ''
            };
        }
    }

    @Post('/:user/:key/vaultage_api')
    public async push(
        @Body() request: UpdateCipherRequest,
        @Param('user') username: string,
        @Param('key') password: string)
        : Promise<IPushPullResponse> {

        try {
            const dbAccess = await this.db.auth({
                username,
                password
            });

            const data = await dbAccess.save(request);

            return {
                error: false,
                description: '',
                data: data
            };
        } catch (err) {
            return {
                error: true,
                description: ('' + err),
                data: ''
            };
        }
    }
}
