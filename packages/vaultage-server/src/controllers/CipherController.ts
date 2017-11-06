import { PullResponse } from '../dto/PullResponse';
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
    public pull(): Promise<PullResponse> {
        return this.repository.load().then(data => ({
            error: false,
            description: '',
            data: data
        }));
    }

    @Post('/:user/:key/vaultage_api')
    @UseBefore(auth)
    public push(@Body() request: UpdateCipherRequest) {
        console.log(request);
        return this.repository.save(request.new_data, request);
    }
}
