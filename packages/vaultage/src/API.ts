import { Application } from 'express';
import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';

import { CipherController } from './controllers/CipherController';
import { ConfigController } from './controllers/ConfigController';
import { IVaultageConfig } from './IVaultageConfig';

export { IVaultageConfig } from './IVaultageConfig';


export abstract class API {
    public static create(app: Application, initialConfig?: IVaultageConfig ) {
        if (initialConfig) {
            Container.set('config', initialConfig);
        }
        useExpressServer(app, {
            controllers: [
                CipherController,
                ConfigController
            ],
        });
    }
}
