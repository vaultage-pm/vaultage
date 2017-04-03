import * as xhr from 'xhr';
import * as createHash from 'sha.js';
import { JsonFormatter, CryptoJS } from './crypto.lib';

export enum ERROR_CODE {
    NOT_AUTHENTICATED = 1,
    BAD_REMOTE_CREDS,
    CANNOT_DECRYPT,
    NETWORK_ERROR
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
}

interface VaultDBEntry {

}

interface Credentials {
    localPwdHash: string;
    remotePwdHash: string;
    serverURL: string;
    username: string;
}

/**
 * The vault class.
 * 
 * @example
 * var vault = new Vault();
 * vault.auth(some_url, some_username, some_local_pwd, some_remote_pwd, function(err) {
 *   if (err) throw err;
 * 
 *   var nb_entries = vault.getNbEntries();
 *   console.log('Success! Fetched ' + nb_entries + ' entries.');
 * });
 */
export class Vault {
    private _creds: (Credentials|undefined);
    private _db: (VaultDBEntry[]|undefined);


    /**
     * Attempts to pull the cipher and decode it. Saves credentials on success.
     * @param {string} serverURL URL to the vaultage server.
     * @param {string} username The username used to locate the cipher on the server
     * @param {string} localPassword The local password used to decode the cipher
     * @param {string} remotePassword The remote password used to locate the cipher on the server
     * @param {(err?: VaultageError, vault: Vault) => void} cb Callback invoked on completion. err is null if no error occured.
     */
    public auth(
            serverURL: string, 
            username: string, 
            localPassword: string, 
            remotePassword: string, 
            cb: (err: (VaultageError | null), vault: Vault) => void
    ): void {
        let remotePwdHash = hash(remotePassword);
        let localPwdHash = hash(localPassword);
        let creds = {serverURL, username, localPwdHash, remotePwdHash};

        this._pullCipher(creds, (err) => {
            if (!err) {
                this._setCredentials(creds);
            }
            cb(err, this);
        });
    }

    /**
     * Un-authenticates this vault
     */
    public unauth(): void {
        this._creds = undefined;
        this._db = undefined;
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
        return this._db.length;
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
            localPwdHash: creds.localPwdHash,
            remotePwdHash: creds.remotePwdHash
        };
    }

    private _pullCipher(creds: Credentials, cb: (err: (VaultageError|null)) => void): void {
        xhr({
            url: makeURL(creds.serverURL, creds.username, creds.remotePwdHash)
        }, (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, err.toString()));
            }

            let body = JSON.parse(resp.body);
            if (body.error != null && body.error === true) {
                cb(new VaultageError(ERROR_CODE.BAD_REMOTE_CREDS, 'Wrong username / remote password (or DB link inactive).'));
                return;
            }

            let cipher = (body.data || '').replace(/[^a-z0-9+/:"{},]/ig, '');
            this._db = [];

            if (cipher && body.data) {
                try {
                    let plain = CryptoJS.AES.decrypt(cipher, creds.localPwdHash, {
                        format: JsonFormatter
                    }).toString(CryptoJS.enc.Utf8);
                    this._db = JSON.parse(plain);
                } catch (e) {
                    cb(new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occured while decrypting the cipher:\n', e));
                    return;
                }
            }
            cb(null);
        });
    }
}


// Utility functions

function makeURL(serverURL: string, username: string, remotePwdHash: string) {
    return serverURL + username + '/' + remotePwdHash + '/do'; //do is just for obfuscation
}

function hash(plain: string): string {
    let sha256 = createHash('sha256');
    return sha256.update(plain, 'utf8').digest('hex');
}
