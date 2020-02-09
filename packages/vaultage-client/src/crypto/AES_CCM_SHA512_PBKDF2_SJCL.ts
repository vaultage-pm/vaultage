import { ISaltsConfig } from '../interface';
import { ERROR_CODE, VaultageError } from '../VaultageError';
import { ICryptoSuite } from './CryptoSuite';

// tslint:disable-next-line:no-var-requires
const sjcl = require('../../lib/sjcl') as any;

// tslint:disable-next-line: class-name
export class AES_CCM_SHA512_PBKDF2_SJCL implements ICryptoSuite<string> {

    public PBKDF2_DIFFICULTY: number = 32768;

    constructor(public salts: ISaltsConfig) {
    }

    public async hash(data: string): Promise<string>  {
        const hash = sjcl.hash.sha512.hash(data);
        return Promise.resolve(hash);
    }

    public async pbkdf(salt: string, data: string): Promise<string>  {
        const hash = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(data , salt, this.PBKDF2_DIFFICULTY));
        return Promise.resolve(hash);
    }

    public symmetric_encrypt(key: KeyType, message: string): Promise<string> {
        const cipher = sjcl.encrypt(key, message);
        return Promise.resolve(cipher);
    }

    public symmetric_decrypt(key: KeyType, cipher: string): Promise<string> {
        try {
            const plaintext = sjcl.decrypt(key, cipher);
            return Promise.resolve(plaintext);
        } catch (e) {
            throw new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occurred while decrypting the cipher', e);
        }
    }
}