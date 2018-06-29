import { ICipherFormat } from '../ICipherFormat';
import { ISaltsConfig } from '../interface';
import { ERROR_CODE, VaultageError } from '../VaultageError';
import { ICrypto } from './ICrypto';

// Monkey-patch wrong type definitions
declare module 'crypto' {
    // tslint:disable:no-shadowed-variable
    export function createDecipheriv(algorithm: string, key: any, iv: any, options?: any): Decipher;
    export function createCipheriv(algorithm: string, key: any, iv: any, options?: any): Cipher;
    // tslint:enable:no-shadowed-variable
}

/**
 * Handles the crypto stuff
 */
export class Crypto implements ICrypto {

    public PBKDF2_DIFFICULTY: number = 32768;

    private crypto = import(/* webpackChunkName: "crypto" */ 'crypto');

    constructor(
            private _salts: ISaltsConfig) {
    }

    /**
     * Returns the local key for a given LOCAL_KEY_SALT and master password.
     *
     * @param masterPassword Plaintext of the master password
     */
    public async deriveLocalKey(masterPassword: string): Promise<string> {
        const crypto = await this.crypto;
        const hash = crypto.createHash('sha512');
        const masterHash = hash.update(masterPassword, 'utf8').digest();
        return crypto.pbkdf2Sync(masterHash, this._salts.LOCAL_KEY_SALT, this.PBKDF2_DIFFICULTY, 32, 'sha256').toString('hex');
    }

    /**
     * Returns the remote key for a given REMOTE_KEY_SALT and master password.
     *
     * @param masterPassword Plaintext of the master password
     */
    public async deriveRemoteKey(masterPassword: string): Promise<string> {
        const crypto = await this.crypto;
        const hash = crypto.createHash('sha512');
        const masterHash = hash.update(masterPassword, 'utf8').digest();
        return crypto.pbkdf2Sync(masterHash, this._salts.REMOTE_KEY_SALT, this.PBKDF2_DIFFICULTY, 32, 'sha256').toString('hex');
    }

    /**
     * Performs the symetric encryption of a plaintext.
     *
     * Used to encrypt the vault's serialized data.
     *
     * @param localKey Local encryption key
     * @param plain The plaintext to encrypt
     */
    public async encrypt(localKey: string, plain: string): Promise<string> {
        try {
            return await this._encrypt(localKey, plain);
        } catch (e) {
            throw new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occurred while decrypting the cipher', e);
        }
    }

    /**
     * Performs the symetric decryption of a plaintext.
     *
     * Used to decrypt the vault's serialized data.
     *
     * @param localKey Local encryption key
     * @param cipher The ciphertext to encrypt
     */
    public async decrypt(localKey: string, cipher: string): Promise<string> {
        try {
            return await this._decrypt(localKey, cipher);
        } catch (e) {
            throw new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occurred while decrypting the cipher', e);
        }
    }

    /**
     * Computes the fingerprint of a plaintext.
     *
     * Used to prove to our past-self that we have access to the local key and the latest
     * vault's plaintext and and challenge our future-self to do the same.
     *
     * @param plain the serialized vault's plaintext
     * @param localKey the local key
     * @param username the username is needed to salt the fingerprint
     */
    public async getFingerprint(plain: string, localKey: string): Promise<string> {
        // We want to achieve two results:
        // 1. Ensure that we don't push old content over some newer content
        // 2. Prevent unauthorized pushes even if the remote key was compromized
        //
        // For 1, we need to fingerprint the plaintext of the DB as well as the local key.
        // Without the local key we could not detect when the local key changed and
        // might overwrite a DB that was re-encrypted with a new local password.
        //
        // The localKey is already derived from the username, some per-deployment salt and
        // the master password so using it as a salt here should be enough to show that we know
        // all of the above information.
        const crypto = await this.crypto;
        return crypto.pbkdf2Sync(plain, localKey, this.PBKDF2_DIFFICULTY, 32, 'sha256').toString('hex');
    }

    private async _encrypt(localKey: string, plain: string) {
        const crypto = await this.crypto;

        const iter = 1000;
        const ts = 64;
        const ks = 128;
        const salt = crypto.randomBytes(8);
        const iv = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(localKey, salt, iter, 32, 'sha256');
        const pt = Buffer.from(plain, 'utf8');

        const c = crypto.createCipheriv('aes-128-ccm', key.slice(0, ks / 8), this.adjustIV(iv, pt.length), {
            authTagLength: ts / 8
        });
        const ciphertext = c.update(pt);
        c.final();
        const tag = c.getAuthTag();

        const ct = Buffer.concat([ciphertext, tag]);

        const cipher: ICipherFormat = {
            ct: ct.toString('base64'),
            iv: iv.toString('base64'),
            salt: salt.toString('base64'),
            iter,
            ks,
            mode: 'ccm',
            ts,
            v: 1
        };

        return JSON.stringify(cipher);
    }

    private async _decrypt(localKey: string, cipher: string) {
        const crypto = await this.crypto;

        const decoded = JSON.parse(cipher) as ICipherFormat;
        const originalIV = Buffer.from(decoded.iv, 'base64');
        const salt = Buffer.from(decoded.salt, 'base64');
        const ct = Buffer.from(decoded.ct, 'base64');
        const key = crypto.pbkdf2Sync(localKey, salt, decoded.iter, 32, 'sha256');
        const tag = ct.slice(ct.length - decoded.ts / 8);
        const out = ct.slice(0, ct.length - decoded.ts / 8);

        const adjustedIV = this.adjustIV(originalIV, ct.length);

        const c = crypto.createDecipheriv('aes-128-ccm', key.slice(0, decoded.ks / 8), adjustedIV, {
            authTagLength: 8
        });
        c.setAuthTag(tag);
        const pt = c.update(out, 'binary', 'utf8');
        c.final('utf8');
        return pt;
    }

    private adjustIV(iv: Buffer, ctLength: number): Buffer {
        const ol = ctLength * 8;
        const ivl = iv.length;
        let L: number;
        for (L = 2; L < 4 && ol >>> 8 * L; L++) { /* magic */ }
        if (L < 15 - ivl) { L = 15 - ivl; }
        return iv.slice(0, (15 - L));
    }
}
