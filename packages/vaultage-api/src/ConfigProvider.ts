import 'reflect-metadata';
import { Service } from 'typedi';
import { IVaultageConfig } from './IVaultageConfig';

@Service('config')
export class ConfigProvider {
    public config: IVaultageConfig = {
        salts: {
            USERNAME_SALT: 'nosalt'
        }
    };
}
