import { Body, Controller, Get, Param, Post } from 'routing-controllers';

@Controller()
export class CipherController {

    // TODO: use a middleware to preprocess authentication

    @Get('/:user/:key/cipher')
    public pull(@Param('user') _id: number) {
        return 'Action pull';
    }

    @Post('/:user/:key/cipher')
    public push(@Body() _req: any) {
        return 'Action push';
    }

    @Post('/:user/:key/key')
    public setKey() {
        return 'Action changekey';
    }
}
