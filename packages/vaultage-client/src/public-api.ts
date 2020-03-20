import 'reflect-metadata';

import { createMainContainer } from './main-module';
import { MainService } from './main-service';
import { PasswordsService } from './passwords/passwords-service';

export { PasswordsService } from './passwords/passwords-service';
export { Vault } from './vault/Vault';
export { VaultageError, ERROR_CODE } from './VaultageError';
export * from './interface';


const container = createMainContainer();

// @public
const vaultage = container.resolve(MainService);
export default vaultage;

// @public
export const passwords = container.resolve(PasswordsService);
