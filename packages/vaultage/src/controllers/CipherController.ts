import { DatabaseWithAuth } from '../storage/Database';
import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { Inject } from 'typedi';

import { PushPullResponse } from '../messages/PullResponse';
import { UpdateCipherRequest } from '../messages/UpdateCipherRequest';

/**
 * This CipherController provides the API methods "pull" and "push".
 * It is meant to be registered on an existing Express server via the VaultageServer class.
 */
@JsonController()
export class CipherController {

    @Inject()
    private repository: DatabaseWithAuth;

    @Get('/:user/:key/vaultage_api')
    public async pull(
            @Param('user') username: string,
            @Param('key') password: string)
            : Promise<PushPullResponse> {

        const repo = await this.repository.auth({
            username,
            password
        });

        const data = await repo.load();
        
        return {
            error: false,
            description: '',
            data: data
        };
    }

    @Post('/:user/:key/vaultage_api')
    public async push(
            @Body() request: UpdateCipherRequest,
            @Param('user') username: string,
            @Param('key') password: string)
            : Promise<PushPullResponse> {

        const repo = await this.repository.auth({
            username,
            password
        })
        
        const data = await repo.save(request.new_data, request);
        
        return {
            error: false,
            description: '',
            data: data
        };
    }
}
