import * as request from 'request';
import * as _sjcl from './sjcl';

// sjcl has no typing
let sjcl = _sjcl as any;

export enum ERROR_CODE {
    NOT_AUTHENTICATED = 1,
    BAD_REMOTE_CREDS,
    CANNOT_DECRYPT,
    NETWORK_ERROR,
    NOT_FAST_FORWARD
};

/**
 * Class for errors coming from the Vaultage lib.
 * @constructor
 * 
 * @member {number} code Code as defined in Vaultage.ERROR_CODES. Rely on this when processing the error.
 * @member {string} message Human readable error message. Do not rely on this when processing the error.
 * @member {?Error} cause Exception causing this error
 */
class VaultageError extends Error{
    constructor(
        public readonly code: ERROR_CODE,
        public readonly message: string,
        public readonly cause?: Error) {
            super(message);
    }

    public toString(): string {
        var str = this.message;
        if (this.cause) {
            str += "\nCaused by: " + this.cause;
        }
        return str;
    }
}

/**
 * Internal class for handling the vault data.
 * 
 * Exposed solely for debugging purpose.
 */
export class VaultDB {
    private static VERSION: number = 0;

    public constructor(
            private _entries: VaultDBEntry[],
            private _revision: number = 0) {
    }

    public static serialize(db: VaultDB): string {
        const entries: string[] = [];
        const n_entries = db._entries.length;
        const expectedLength = n_entries * BYTES_PER_ENTRY + MIN_DB_LENGTH;

        let serialized = JSON.stringify({
            entries: db._entries,
            v: VaultDB.VERSION,
            r: db._revision
        });

        const amountToPad = expectedLength - serialized.length;
        let pad = "";
        for (let i = 0 ; i < amountToPad ; i++) {
            pad += " ";
        }

        // Padding with spaces does not affect the encoded data since it's JSON but
        // it does change the cipher length.
        return serialized + pad;
    }

    public static deserialize(ser: string): VaultDB {
        const data = JSON.parse(ser);
        return new VaultDB(data.entries, data._revision);
    }

    /**
     * Returns the number of entries in this DB.
     */
    public size() {
        return this._entries.length;
    }

    /**
     * Bumps the revision number of this DB.
     */
    public newRevision() {
        this._revision ++;
    }
}

interface VaultDBEntry {

}

interface Credentials {
    localKey: string;
    remoteKey: string;
    serverURL: string;
    username: string;
}

/**
 * Handles the crypto stuff
 */
export abstract class Crypto {

    private static hashUsername(username: string): Uint32Array {
        return sjcl.hash.sha256.hash(username + USERNAME_SALT);
    }

    /**
     * Returns the local key for a given username and master password.
     * 
     * API consumers should not use this method
     * 
     * @param username The username used to locate the cipher on the server
     * @param masterPassword Plaintext of the master password
     */
    public static deriveLocalKey(username: string, masterPassword: string): string {
        let localSalt = Crypto.hashUsername(username).slice(5, 8);
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterPassword, localSalt, PBKF2_DIFFICULTY));
    }

    /**
     * Returns the remote key for a given username and master password.
     * 
     * This method can be used to configure the db with the correct remote key.
     * 
     * @param username The username used to locate the cipher on the server
     * @param masterPassword Plaintext of the master password
     */
    public static deriveRemoteKey(username: string, masterPassword: string): string {
        let remoteSalt = Crypto.hashUsername(username).slice(0, 4);
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterPassword, remoteSalt, PBKF2_DIFFICULTY));
    }

    /**
     * Performs the symetric encryption of a plaintext.
     * 
     * Used to encrypt the vault's serialized data.
     * 
     * @param localKey Local encryption key
     * @param plain The plaintext to encrypt
     */
    public static encrypt(localKey: string, plain: string): string {
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
    public static decrypt(localKey: string, cipher: string): string {
        return sjcl.decrypt(localKey, cipher);
    }

    /**
     * Computes the fingerprint of a plaintext.
     * 
     * Used to prove to our past-self that we have access to the latest vault's plaintext
     * and challenge our future-self to do the same.
     * 
     * @param plain what we want to hash
     */
    public static getFingerprint(plain: string): string {
        return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(FINGERPRINT_SALT + plain));
    }
}

/**
 * The vault class.
 * 
 * @example
 * var vault = new Vault();
 * vault.auth(some_url, some_username, some_pwd, function(err) {
 *   if (err) throw err;
 * 
 *   var nb_entries = vault.getNbEntries();
 *   console.log('Success! Fetched ' + nb_entries + ' entries.');
 * });
 */
export class Vault {
    private _creds: (Credentials|undefined);
    private _db: (VaultDB|undefined);
    private _lastFingerprint: (string|null) = null;


    /**
     * Attempts to pull the cipher and decode it. Saves credentials on success.
     * @param serverURL URL to the vaultage server.
     * @param username The username used to locate the cipher on the server
     * @param masterPassword Plaintext of the master password
     * @param cb Callback invoked on completion. err is null if no error occured.
     */
    public auth(
            serverURL: string, 
            username: string, 
            masterPassword: string,
            cb: (err: (VaultageError | null), vault: Vault) => void
    ): void {

        let remoteKey = Crypto.deriveRemoteKey(username, masterPassword);
        // possible optimization: compute the local key while the request is in the air
        let localKey = Crypto.deriveLocalKey(username, masterPassword);

        let creds = {serverURL, username, localKey, remoteKey};
        this._pullCipher(creds, (err) => {
            if (!err) {
                this._setCredentials(creds);
            }
            cb(err, this);
        });
    }

    /**
     * Saves the Vault on the server.
     * 
     * The vault must be authenticated before this method can be called.
     * 
     * @param {function} cb Callback invoked with (err: VaultageError, this) on completion. err is null if no error occured.
     */
    public save(cb: (err: (VaultageError|null), vault: Vault) => void): void {
        if (!this._creds || !this._db) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'), this);
        } else {
            // Bumping the revision on each push ensures that there are no two identical consecutive fingerprints
            // (in short we are pretending that we updated something even if we didn't)
            this._db.newRevision();
            this._pushCipher(this._creds, (err) => cb(err, this));
        }
    }



    /**
     * Un-authenticates this vault
     */
    public unauth(): void {
        this._creds = undefined;
        this._db = undefined;
        this._lastFingerprint = null;
    }

    /**
     * Refreshes the local data by pulling the latest cipher from the server.
     * 
     * The vault must be authenticated before this method can be called.
     * 
     * @param {function} cb Callback invoked with (err: VaultageError, this) on completion. err is null if no error occured.
     */
    public refresh(cb: (err: (VaultageError|null), vault: Vault) => void) {
        if (!this._creds) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'), this);
        } else {
            this._pullCipher(this._creds, (err) => cb(err, this));
        }
    }

    /**
     * Gets the number of entries in the db.
     * @return {number} the number of entries in the db.
     * @throws If this vault is not authenticated.
     */
    public getNbEntries(): number {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.size();
    }

    /**
     * Checks whether this instance has had a successful authentication since the last deauthentication.
     * 
     * @return {boolean} true if there was a successful authentication
     */
    public isAuth() {
        // Weak equality with null also checks undefined
        return (this._creds != null);
    }


    // Private methods

    private _setCredentials(creds: Credentials): void {
        // Copy for immutability
        this._creds = {
            serverURL: creds.serverURL,
            username: creds.username,
            localKey: creds.localKey,
            remoteKey: creds.remoteKey
        };
    }

    private _pullCipher(creds: Credentials, cb: (err: (VaultageError|null)) => void): void {
        request({
            url: makeURL(creds.serverURL, creds.username, creds.remoteKey)
        }, (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
            }

            let body = JSON.parse(resp.body);
            if (body.error != null && body.error === true) {
                cb(new VaultageError(ERROR_CODE.BAD_REMOTE_CREDS, 'Wrong username / remote password (or DB link inactive).'));
                return;
            }

            let cipher = (body.data || '').replace(/[^a-z0-9+/:"{},]/ig, '');

            if (cipher && body.data) {
                try {
                    let plain = Crypto.decrypt(creds.localKey, cipher);
                    this._db = VaultDB.deserialize(plain);
                    this._lastFingerprint = Crypto.getFingerprint(plain);
                } catch (e) {
                    cb(new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occured while decrypting the cipher', e));
                    return;
                }
            } else {
                // Create an empty DB if there is nothing on the server.
                this._db = new VaultDB([]);
            }
            cb(null);
        });
    }

    private _pushCipher(creds: Credentials, cb: (err: (VaultageError|null)) => void): void {
        if (this._db == undefined) {
            return cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
        }

        let plain = VaultDB.serialize(this._db);
        let cipher = Crypto.encrypt(creds.localKey, plain);
        let fingerprint = Crypto.getFingerprint(plain);
        request({
            method: 'POST',
            url: makeURL(creds.serverURL, creds.username, creds.remoteKey),
            body: urlencode({
                'data': cipher,
                'last_hash': this._lastFingerprint,
                'new_hash': fingerprint
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err));
            }
            let body = JSON.parse(resp.body);
            if (body.error != null && body.error === true) {
                if (body.non_fast_forward == true) {
                    return cb(new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, 'The server has a newer version of the DB'));
                } else {
                    return cb(new VaultageError(ERROR_CODE.BAD_REMOTE_CREDS, 'Wrong username / remote password (or DB link inactive).'));
                }
            }
            this._lastFingerprint = fingerprint;
            cb(null);
        });
    }
}


// Utility functions

function makeURL(serverURL: string, username: string, remotePwdHash: string) {
    return serverURL + '/' + username + '/' + remotePwdHash + '/do'; //do is just for obfuscation
}

function urlencode(data: any): string {
    let ret: string[] = [];
    let keys = Object.keys(data);
    for (var key of keys) {
        ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return ret.join('&');
}


/*  === Config parameters ===
 * 
 * These can be tweaked from outside the module like this:
 * ```
 * vaultage.PBKF2_DIFFICULTY = 10000;
 * ```
 */

/**
 * How hard should the computation to derive the local and remote keys be.
 * 
 * Higher is harder. 
 * The harder, the longer it takes to brute-force but also the longer it takes to log in.
 */
export var PBKF2_DIFFICULTY = 32768;
/**
 * The local and remote keys use a salt that is derived from the username.
 * 
 * This salt salts the username before generating the salts...
 * 
 * It should be public and per-deployment. It prevents people having the same username/password
 * combination on different deployments from having the same keys.
 */
export var USERNAME_SALT = "vaultage rocks";
/**
 * The fingerprint salt.
 * 
 * Used to salt the db when generating its fingerprint
 */
export var FINGERPRINT_SALT = "make it unique";
/**
 * How many bytes should an entry in the vault be.
 * 
 * When serializing the DB, vaultage adds some padding to make sure the cleartext is
 * at least BYTES_PER_ENTRY * n_entries + constant bytes long.
 * 
 * This prevents an attacker from guessing the vault's contents by its length but the
 * tradeof is that it reveals how many entries the DB contains.
 * 
 * If you want to disable padding, set BYTES_PER_ENTRY to 0.
 */
export var BYTES_PER_ENTRY = 512;
/**
 * Minimum length of the serialized vault.
 * Accounts for the overhead of the JSON skeleton when computing the padding needed.
 */
export var MIN_DB_LENGTH = VaultDB.serialize(new VaultDB([])).length;
