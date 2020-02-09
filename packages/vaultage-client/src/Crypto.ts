import { ISaltsConfig } from './interface';
import { AES_CFB_SHA512_OPENPGPJS } from './crypto/AES_CFB_SHA512_OPENPGPJS';
import { ICryptoSuite } from './crypto/CryptoSuite';
import { AES_CCM_SHA512_PBKDF2_SJCL } from './crypto/AES_CCM_SHA512_PBKDF2_SJCL';

/**
 * Handles the crypto stuff
 */
export class Crypto {

    private cryptoSuite: ICryptoSuite<string>;

    constructor(salts: ISaltsConfig, suite='AES_CFB_SHA512_OPENPGPJS') {
        switch(suite) {
            case 'AES_CCM_SHA512_PBKDF2_SJCL':
                this.cryptoSuite = new AES_CCM_SHA512_PBKDF2_SJCL(salts);
                break;
            case 'AES_CFB_SHA512_OPENPGPJS':
            default:
                this.cryptoSuite = new AES_CFB_SHA512_OPENPGPJS(salts);
                break;
        }
    }

    /**
     * Performs the symetric encryption of a plaintext.
     */
    public async encrypt(localKey: string, plaintext: string): Promise<string> {
        return this.cryptoSuite.symmetric_encrypt(localKey, plaintext);
    }

    /**
     * Performs the symetric decryption of a plaintext.
     */
    public async decrypt(localKey: string, cipher: string): Promise<string> {
        return this.cryptoSuite.symmetric_decrypt(localKey, cipher);
    }

    /**
     * Returns the local key computed as PBKDF2(LOCAL_KEY_SALT || hash(masterHash))
     * @param masterPassword
     */
    public async deriveLocalKey(masterPassword: string): Promise<string> {
        const masterHash = await this.cryptoSuite.hash(masterPassword);
        return await this.cryptoSuite.pbkdf(this.cryptoSuite.salts.LOCAL_KEY_SALT, masterHash);
    }

    /**
     * Returns the local key computed as PBKDF2(REMOTE_KEY_SALT || hash(masterHash))
     * @param masterPassword
     */
    public async deriveRemoteKey(masterPassword: string): Promise<string> {
        const masterHash = await this.cryptoSuite.hash(masterPassword);
        return await this.cryptoSuite.pbkdf(this.cryptoSuite.salts.REMOTE_KEY_SALT, masterHash);
    }

    /**
     * Returns the "fingerprint" of the local DB, computed as PBKDF2(REMOTE_KEY_SALT || hash(masterHash))
     * @param plain the serialized vault's plaintext
     * @param localKey
     */
    public async getFingerprint(databasePlaintext: string, localKey: string): Promise<string> {
        // Use of the "fingerprint":
        // 1. Ensure that we don't push old content over some newer content (e.g., pushed by another device)
        // 2. Prevent unauthorized pushes even if the remote key was compromized
        //
        // 1. is achieved by giving the *previous* fingerprint along with an update; if it doesn't match
        // the one stored in the server, this is a dirty write.
        // 2. if the remote key is compromised but not the server logic, the adversary still need to the local
        // key to produce the fingerprint
        return await this.cryptoSuite.pbkdf(localKey, databasePlaintext);
    }
}
