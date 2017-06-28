import { Config } from './Config';

const sjcl = require('../sjcl') as any;


export interface SaltsConfig {
    USERNAME_SALT: string;
}

/**
 * Handles the crypto stuff
 */
export class Crypto {


    constructor(
            private _config: Config,
            private _salts: SaltsConfig) {
    }

    private hashUsername(username: string): Uint32Array {
        return sjcl.hash.sha256.hash(username + this._salts.USERNAME_SALT);
    }

    /**
     * Returns the local key for a given username and master password.
     *
     * API consumers should not use this method
     *
     * @param username The username used to locate the cipher on the server
     * @param masterPassword Plaintext of the master password
     */
    public deriveLocalKey(username: string, masterPassword: string): string {
        let localSalt = this.hashUsername(username).slice(5, 8);
        // We convert the master password to a fixed length using sha256 then use the first half
        // of that result for creating the local key.
        // Since we use the second half for the remote key and there is no way to derive the first half
        // of a hash given its second half, then **even if** the remote key leaks AND pbkdf2 is found
        // to be reversible, we still cannot find the local key.
        let masterHash = sjcl.hash.sha512.hash(masterPassword);
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterHash.slice(0, 8) , localSalt, this._config.PBKDF2_DIFFICULTY));
    }

    /**
     * Returns the remote key for a given username and master password.
     *
     * This method can be used to configure the db with the correct remote key.
     *
     * @param username The username used to locate the cipher on the server
     * @param masterPassword Plaintext of the master password
     */
    public deriveRemoteKey(username: string, masterPassword: string): string {
        let remoteSalt = this.hashUsername(username).slice(0, 4);
        let masterHash = sjcl.hash.sha512.hash(masterPassword);
        let result = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterHash.slice(8, 16), remoteSalt, this._config.PBKDF2_DIFFICULTY));
        console.log(result);
        return result;
    }

    /**
     * Performs the symetric encryption of a plaintext.
     *
     * Used to encrypt the vault's serialized data.
     *
     * @param localKey Local encryption key
     * @param plain The plaintext to encrypt
     */
    public encrypt(localKey: string, plain: string): string {
        return sjcl.encrypt(localKey, plain);
    }

    /**
     * Performs the symetric decryption of a plaintext.
     *
     * Used to decrypt the vault's serialized data.
     *
     * @param localKey Local encryption key
     * @param cipher The ciphertext to encrypt
     */
    public decrypt(localKey: string, cipher: string): string {
        return sjcl.decrypt(localKey, cipher);
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
    public getFingerprint(plain: string, localKey: string): string {
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
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(plain, localKey, this._config.PBKDF2_DIFFICULTY));
    }
}