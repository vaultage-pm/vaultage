import { ISaltsConfig } from '../interface';
import { ERROR_CODE, VaultageError } from '../VaultageError';
import { ICryptoSuite } from './CryptoSuite';

// tslint:disable-next-line:no-var-requires
const openpgp = require('openpgp');

// tslint:disable-next-line: class-name
export class AES_CFB_SHA512_OPENPGPJS implements ICryptoSuite<string> {

    public PBKDF2_DIFFICULTY: number = 32768;

    constructor(public salts: ISaltsConfig) {
    }

    public async hash(data: string): Promise<string>  {
        const hash = await openpgp.crypto.hash.sha512(data);
        console.log("Got", data, "output", hash)
        return hash
    }

    public async pbkdf(salt: string, data: string): Promise<string>  {
        return openpgp.crypto.hash.sha512(salt + data);
    }

    public async symmetric_encrypt(key: KeyType, message: string): Promise<string> {
        const cipher = await openpgp.encrypt({
            message: openpgp.message.fromText(message),
            passwords: [key],
            armor: true
        });

        return cipher.data;
    }

    public async symmetric_decrypt(key: KeyType, cipher: string): Promise<string> {
        try {
            const res = await openpgp.decrypt({
                message: await openpgp.message.readArmored(cipher),
                passwords: [key]
            });
            return res.data;
        } catch (e) {
            throw new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occurred while decrypting the cipher', e);
        }
    }
}
