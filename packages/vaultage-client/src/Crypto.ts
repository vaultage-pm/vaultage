// tslint:disable-next-line:no-var-requires
const sjcl = require('../lib/sjcl') as any;

export interface ISaltsConfig {
    LOCAL_KEY_SALT: string;
    REMOTE_KEY_SALT: string;
}

/**
 * Handles the crypto stuff
 */
export class Crypto {

    public PBKDF2_DIFFICULTY: number = 32768;

    constructor(
            private _salts: ISaltsConfig) {
    }

    /**
     * Returns the local key for a given LOCAL_KEY_SALT and master password.
     *
     * @param masterPassword Plaintext of the master password
     */
    public deriveLocalKey(masterPassword: string): string {
        const masterHash = sjcl.hash.sha512.hash(masterPassword);
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterHash , this._salts.LOCAL_KEY_SALT, this.PBKDF2_DIFFICULTY));
    }

    /**
     * Returns the remote key for a given REMOTE_KEY_SALT and master password.
     *
     * @param masterPassword Plaintext of the master password
     */
    public deriveRemoteKey(masterPassword: string): string {
        const masterHash = sjcl.hash.sha512.hash(masterPassword);
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterHash, this._salts.REMOTE_KEY_SALT, this.PBKDF2_DIFFICULTY));
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
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(plain, localKey, this.PBKDF2_DIFFICULTY));
    }
}
