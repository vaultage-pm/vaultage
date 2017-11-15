import { Application } from 'express';
import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';

import { CipherController } from './controllers/CipherController';
import { ConfigController } from './controllers/ConfigController';
import { VaultageConfig } from './VaultageConfig';

export { VaultageConfig } from './VaultageConfig';

/**
 * VaultageServer is responsible for providing the Vaultage API (pull, push, etc) to the clients.
 * It takes an existing and instantiated Express App server, on which it will bind its routes.
 * Of course, you should call expressApp.listen() after having starter the VaultageServer on it.
 */
export abstract class VaultageServer {
    public static bindToServer(expressApp: Application, initialConfig?: VaultageConfig ) {
        if (initialConfig) {
            Container.set('config', initialConfig);
        }
        // registers our routes (present in Cipher/ConfigController) on this express server
        useExpressServer(expressApp, {
            controllers: [
                CipherController,
                ConfigController
            ]
        });
    }
}
