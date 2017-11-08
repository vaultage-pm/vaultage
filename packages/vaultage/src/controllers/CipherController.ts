import { CipherRepository } from '../storage/CipherRepository';
import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { Inject } from 'typedi';

import { PushPullResponse } from '../dto/PullResponse';
import { UpdateCipherRequest } from '../dto/UpdateCipherRequest';

@JsonController()
export class CipherController {

    @Inject()
    private repository: CipherRepository;

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
