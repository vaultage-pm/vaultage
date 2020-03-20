import { container } from 'tsyringe';

import { MainService } from './main-service';
import { MergeService } from './merge-service';
import { HttpApi } from './transport/http-api';
import { HttpService } from './transport/http-service';
import { VaultService } from './vault/vault-service';
import { VaultDBService } from './vault/vaultdb-service';
import { PasswordsService } from './passwords/passwords-service';
import { IRandomness, ConcreteRandomnessGenerator } from './passwords/randomness-generator';

export function createMainContainer() {
    container.registerSingleton(HttpApi);
    container.registerSingleton(HttpService);
    container.registerSingleton(MainService);
    container.registerSingleton(MergeService);
    container.registerSingleton(VaultService);
    container.registerSingleton(VaultDBService);
    container.registerSingleton(PasswordsService);
    container.register(IRandomness, { useClass: ConcreteRandomnessGenerator});

    return container;
}
