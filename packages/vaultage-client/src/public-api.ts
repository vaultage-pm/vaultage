import { createMainContainer } from 'src/main-module';
import { MainService } from 'src/main-service';
import { PasswordsService } from 'src/passwords/passwords-service';

export { PasswordsService } from 'src/passwords/passwords-service';
export { Vault } from 'src/vault/Vault';
export { VaultageError, ERROR_CODE } from 'src/VaultageError';
export * from 'src/interface';


const container = createMainContainer();


const vaultage = container.get(MainService);
export default vaultage;

export const passwords = container.get(PasswordsService);
