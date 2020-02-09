import { ISaltsConfig } from '../interface';

export interface ICryptoSuite<KeyType> {
    salts: ISaltsConfig;
    hash(data: string): Promise<string>;
    pbkdf(salt: string, data: string): Promise<string>;
    symmetric_encrypt(key: KeyType, message: string): Promise<string>,
    symmetric_decrypt(key: KeyType, message: string): Promise<string>,
}