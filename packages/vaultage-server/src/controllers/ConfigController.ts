import { Get, JsonController } from 'routing-controllers';
import { Inject } from 'typedi';

import { IVaultageConfig } from '../IVaultageConfig';

@JsonController()
export class ConfigController {

    @Inject('config')
    private config: IVaultageConfig;

    @Get('/config')
    protected getConfig(): IVaultageConfig {
        return this.config;
    }
}
