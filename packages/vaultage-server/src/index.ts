import 'reflect-metadata';

import { Application } from 'express';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { Inject } from 'typedi';

import { ConfigProvider } from './ConfigProvider';
import { CipherController } from './controllers/CipherController';
import { ConfigController } from './controllers/ConfigController';
import { IVaultageConfig } from './IVaultageConfig';

export { IVaultageConfig } from './IVaultageConfig';

useContainer(Container);

@Service()
class App {
    @Inject('config')
    private config: ConfigProvider;

    public create(app: Application, initialConfig?: IVaultageConfig ): void {
        if (initialConfig) {
            this.config.config = initialConfig;
        }
        useExpressServer(app, {
            controllers: [
                CipherController,
                ConfigController
            ],
        });
    }
}

export abstract class API {

    public static create(server: Application, config?: IVaultageConfig ) {
        const app = Container.get(App);
        app.create(server, config);
    }
}
