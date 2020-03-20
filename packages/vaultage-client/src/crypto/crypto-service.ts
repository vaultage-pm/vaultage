import { injectable } from 'inversify';
import { Crypto } from 'src/crypto/Crypto.node';
import { ICrypto } from 'src/crypto/ICrypto';
import { ISaltsConfig } from 'src/interface';

@injectable()
export class CryptoService {
    getCrypto(salts: ISaltsConfig): ICrypto {
        return new Crypto(salts);
    }
}
