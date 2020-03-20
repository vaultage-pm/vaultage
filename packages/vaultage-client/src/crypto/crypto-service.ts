import { injectable } from 'tsyringe';
import { Crypto } from './Crypto.node';
import { ICrypto } from './ICrypto';
import { ISaltsConfig } from '../interface';

@injectable()
export class CryptoService {
    getCrypto(salts: ISaltsConfig): ICrypto {
        return new Crypto(salts);
    }
}
