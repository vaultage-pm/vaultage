import { Get, JsonController } from 'routing-controllers';
import { Inject } from 'typedi';

import { IVaultageConfig } from '../VaultageConfig';

/**
 * This ConfigController provides the API method "getConfig".
 * It is meant to be registered on an existing Express server via the VaultageServer class.
 */
@JsonController()
export class ConfigController {

    @Get('/version')
    public async version(): Promise<string> {
        const { version } = require('../../../package.json');
        return version;
    }

    @Inject('config')
    private config: IVaultageConfig;

    @Get('/config')
    protected getConfig(): IVaultageConfig {
        return this.config;
    }
}
