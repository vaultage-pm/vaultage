import { PushPullResponse } from '../dto/PullResponse';
import { Inject } from 'typedi';
import { CipherRepository } from '../storage/CipherRepository';
import { UpdateCipherRequest } from '../dto/UpdateCipherRequest';
import { auth } from '../middleware/authMiddleware';
import { Body, Controller, Get, Post, UseBefore } from 'routing-controllers';

@Controller()
export class CipherController {

    @Inject()
    private repository: CipherRepository;

    @Get('/:user/:key/vaultage_api')
    @UseBefore(auth)
    public pull(): Promise<PushPullResponse> {
        return this.repository.load().then(data => ({
            error: false,
            description: '',
            data: data
        }));
    }

    @Post('/:user/:key/vaultage_api')
    @UseBefore(auth)
    public async push(@Body() request: UpdateCipherRequest): Promise<PushPullResponse> {
        await this.repository.save(request.new_data, request);
        
        return this.repository.load().then(data => ({
            error: false,
            description: '',
            data: data
        }));
    }
}
