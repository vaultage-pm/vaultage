import * as request from 'request';

import { PasswordStrength } from './Passwords';
import { SaltsConfig, Crypto } from './Crypto';
import { deepCopy } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';
import { VaultDB, VaultDBEntry, VaultDBEntryAttrs } from './VaultDB';

export interface Credentials {
    localKey: string;
    remoteKey: string;
    serverURL: string;
    username: string;
}

export interface ApiCallFunction {
    (parameters: any, cb: (err: any, resp: any) => void) : void
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
    private _creds?: Credentials;
    private _db?: VaultDB;
    private _crypto: Crypto;
    private _lastFingerprint?: string;
    private _apiCallFunction: ApiCallFunction;

    constructor(salts : SaltsConfig, apiCallFunction?: ApiCallFunction) {
        this._crypto = new Crypto(salts);

        // if no function was given to reach the backend, use Requests (this is for production)
        if (apiCallFunction == undefined){
            this._apiCallFunction = (parameters: any, cb: (err: any, resp: any) => void) => {
                request(parameters, cb);
            }
        } else {
            // this is for testing
            this._apiCallFunction = apiCallFunction;
        }
    }

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
            cb: (err: (VaultageError | null)) => void
    ): void {

        let creds = {
            serverURL: serverURL.replace(/\/$/, ''), // Removes trailing slash
            username: username,
            localKey: 'null',
            remoteKey: 'null'
        };

        let remoteKey = this._crypto.deriveRemoteKey(masterPassword);
        // possible optimization: compute the local key while the request is in the air
        let localKey = this._crypto.deriveLocalKey(masterPassword);

        creds.localKey = localKey;
        creds.remoteKey = remoteKey;

        this._pullCipher(creds, (err) => {
            if (!err) {
                this._setCredentials(creds);
            }
            cb(err);
        });
    }

    /**
     * Un-authenticates this vault and clears the TFA configuration.
     */
    public unauth(): void {
        this._creds = undefined;
        this._db = undefined;
        this._lastFingerprint = undefined;
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

    public getDBRevision():number{
        if (!this._db) {
            return -1;
        }
        return this._db.getRevision()
    }


    /**
     * Saves the Vault on the server.
     *
     * The vault must be authenticated before this method can be called.
     *
     * @param {function} cb Callback invoked with (err: VaultageError, this) on completion. err is null if no error occured.
     */
    public save(cb: (err: (VaultageError|null)) => void): void {
        if (!this._creds || !this._db) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
        } else {
            // Bumping the revision on each push ensures that there are no two identical consecutive fingerprints
            // (in short we are pretending that we updated something even if we didn't)
            this._db.newRevision();
            this._pushCipher(this._creds, null, (err) => cb(err));
        }
    }

    /**
     * Refreshes the local data by pulling the latest cipher from the server.
     *
     * The vault must be authenticated before this method can be called.
     *
     * @param {function} cb Callback invoked with (err: VaultageError, this) on completion. err is null if no error occured.
     */
    public pull(cb: (err: (VaultageError|null)) => void): void {
        if (!this._creds) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
        } else {
            this._pullCipher(this._creds, (err) => cb(err));
        }
    }

    /**
     * Changes this vault's master password.
     *
     * The change is synced with the server immediately and
     * this operation fails if it could not sync with the server.
     *
     * @param newPassword The new master password
     * @param cb Callback invoked on completion.
     */
    public updateMasterPassword(newPassword: string, cb: (err: (VaultageError|null)) => void): void {
        if (!this._creds || !this._db) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated'));
        } else {
            let localKey = this._crypto.deriveLocalKey(newPassword);
            let remoteKey = this._crypto.deriveRemoteKey(newPassword);
            let creds = deepCopy(this._creds);
            creds.localKey = localKey;

            this._db.newRevision();
            this._pushCipher(creds, remoteKey, (err) => {
                if (!err) {
                    if (!this._creds) {
                        cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
                    } else {
                        creds.remoteKey = remoteKey;
                        this._setCredentials(creds);
                    }
                }
                cb(err)
            });
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
     * Adds a new entry in the db
     */
    public addEntry(attrs: VaultDBEntryAttrs): string {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.add(attrs);
    }

    /**
     * Records that one entry has been used (for usage_count statistics)
     * @returns the new usage count
     */
    public entryUsed(id: string): number {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.entryUsed(id);
    }

    /**
     * Deletes an entry
     */
    public removeEntry(id: string): void {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        this._db.remove(id);
    }

    /**
     * Returns the set of entries matching the specified query
     * @param query attribute substrings to match
     */
    public findEntries(...query: string[]): VaultDBEntry[] {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.find(...query);
    }

    /**
     * Returns all weak passwords in the DB
     * @param threshold the threshold below which an entry is returned
     */
    public getWeakPasswords(threshold : PasswordStrength = PasswordStrength.WEAK):VaultDBEntry[] {
        let entries = this.getAllEntries();
        return entries.filter(e => e.password_strength_indication <= threshold)
    }

    /**
     * Returns the set of all entries in the DB
     */
    public getAllEntries(): VaultDBEntry[] {
        return this.findEntries('');
    }

    /**
     * Returns the set of all entries in the DB
     */
    public getEntriesWhichReusePasswords(): VaultDBEntry[] {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.getEntriesWhichReusePasswords();
    }

    /**
     * Edits an entry in the vault.
     *
     * @param id Id of the entry to edit
     * @param attrs new set of attributes. undefined values are ignored (the entry keeps its previous value)
     * @returns an updated version of the entry
     */
    public updateEntry(id: string, attrs: VaultDBEntryAttrs): VaultDBEntry {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        this._db.update(id, attrs);
        return this._db.get(id);
    }

    /**
     * Returns an entry by its id
     */
    public getEntry(id: string): VaultDBEntry {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.get(id);
    }

    /**
     * Replaces the current entries with the new set of provided entries.
     * Then, manually "push" to overwrite the remote database's ciphertext, or "pull" to cancel this import
     * @param entries The entries to replace this db's entries
     */
    public replaceAllEntries(entries: VaultDBEntry[]) {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.replaceAllEntries(entries);
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

        let parameters = {url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey)}
        let innerCallback = (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
            }

            let body: any;
            try {
                body = JSON.parse(resp.body);
            } catch(e) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response'));
            }
            if (body.error != null && body.error === true) {
                if (body.description != null) {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, body.description));
                } else {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, 'Unknown server error'));
                }
            }
            let cipher = (body.data || '').replace(/[^a-z0-9+/:"{},]/ig, '');

            if (cipher && body.data) {
                try {
                    let plain = this._crypto.decrypt(creds.localKey, cipher);
                    this._db = VaultDB.deserialize(plain);
                    this._lastFingerprint = this._crypto.getFingerprint(plain, creds.localKey);
                } catch (e) {
                    return cb(new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occured while decrypting the cipher', e));
                }
            } else {
                // Create an empty DB if there is nothing on the server.
                this._db = new VaultDB({});
                this._lastFingerprint = '';
            }
            cb(null);
        };

        this._apiCallFunction(parameters, innerCallback);
    }

    private _pushCipher(creds: Credentials, newRemoteKey: (string|null), cb: (err: (VaultageError|null)) => void): void {
        if (!this._db || !this._crypto) {
            return cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
        }

        let plain = VaultDB.serialize(this._db);
        let cipher = this._crypto.encrypt(creds.localKey, plain);
        let fingerprint = this._crypto.getFingerprint(plain, creds.localKey);

        let parameters = {
            method: 'POST',
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey),
            body: JSON.stringify({
                'update_key': newRemoteKey,
                'new_data': cipher,
                'old_hash': this._lastFingerprint,
                'new_hash': fingerprint,
                'force': false,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        let innerCallback = (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err));
            }

            let body: any;
            try {
                body = JSON.parse(resp.body);
            } catch(e) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response'));
            }
            if (body.error != null && body.error === true) {
                if (body.not_fast_forward === true) {
                    return cb(new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, 'The server has a newer version of the DB'));
                } else if (body.descrption != null) {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, body.description));
                } else {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, 'Unknown server error'));
                }
            }
            this._lastFingerprint = fingerprint;
            cb(null);
        };

        this._apiCallFunction(parameters, innerCallback);
    }

    private _makeURL(serverURL: string, username: string, remotePwdHash: string): string {
        return `${serverURL}/${username}/${remotePwdHash}/vaultage_api`;
    }
}
