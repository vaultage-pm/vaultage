import { Get, JsonController } from 'routing-controllers';
import { Inject } from 'typedi';

import { VaultageConfig } from '../VaultageConfig';

/**
 * This ConfigController provides the API method "getConfig".
 * It is meant to be registered on an existing Express server via the VaultageServer class.
 */
@JsonController()
export class ConfigController {

    @Inject('config')
    private config: VaultageConfig;

    @Get('/config')
    protected getConfig(): VaultageConfig {
        return this.config;
    }
}
