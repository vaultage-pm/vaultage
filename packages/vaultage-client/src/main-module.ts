import { container as rootContainer } from 'tsyringe';

import { MainService } from './main-service';
import { MergeService } from './merge-service';
import { HttpApi } from './transport/http-api';
import { HttpService } from './transport/http-service';
import { VaultService } from './vault/vault-service';
import { VaultDBService } from './vault/vaultdb-service';
import { PasswordsService } from './passwords/passwords-service';
import { IRandomness, ConcreteRandomnessGenerator } from './passwords/randomness-generator';

export function createMainContainer() {
    const mainContainer = rootContainer.createChildContainer();
    mainContainer.registerSingleton(HttpApi);
    mainContainer.registerSingleton(HttpService);
    mainContainer.registerSingleton(MainService);
    mainContainer.registerSingleton(MergeService);
    mainContainer.registerSingleton(VaultService);
    mainContainer.registerSingleton(VaultDBService);
    mainContainer.registerSingleton(PasswordsService);
    mainContainer.register(IRandomness, { useClass: ConcreteRandomnessGenerator});

    return mainContainer;
}
