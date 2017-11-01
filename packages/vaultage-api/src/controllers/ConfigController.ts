import { Get, JsonController } from 'routing-controllers';
import { Inject } from 'typedi';

import { ConfigProvider } from '../ConfigProvider';
import { IVaultageConfig } from '../IVaultageConfig';

@JsonController()
export class ConfigController {

    @Inject('config')
    private config: ConfigProvider;

    @Get('/config')
    protected getConfig(): IVaultageConfig {
        return this.config.config;
    }
}
