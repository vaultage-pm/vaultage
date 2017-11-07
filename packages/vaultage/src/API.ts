import 'reflect-metadata';

import { Application } from 'express';
import * as path from 'path';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';

import { CipherController } from './controllers/CipherController';
import { ConfigController } from './controllers/ConfigController';
import { IVaultageConfig } from './IVaultageConfig';

export { IVaultageConfig } from './IVaultageConfig';

useContainer(Container);

// Sets defaults
Container.set('cipherLocation', path.join(__dirname, '..', 'cipher.json'));
Container.set('config', {
    salts: {
        USERNAME_SALT: 'nosalt'
    }
});

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
