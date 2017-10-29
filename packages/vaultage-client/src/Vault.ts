import * as request from 'request';

import { Config } from './Config';
import { Crypto } from './Crypto';
import { deepCopy, urlencode } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';
import { VaultDB, VaultDBEntry, VaultDBEntryAttrs } from './VaultDB';

export interface Credentials {
    localKey: string;
    remoteKey: string;
    serverURL: string;
    username: string;
}

export interface TFAConfig {
    method: string;
    request: string;
}

export interface TFARequestData {
    provisioningURI: string;
}

export interface TFAConfirmationData {
    pin: string;
}

export const config: Config = {
    PBKDF2_DIFFICULTY: 32768,
    BYTES_PER_ENTRY: 512,
    MIN_DB_LENGTH: 0 // placeholder 
};
config.MIN_DB_LENGTH = VaultDB.serialize(new VaultDB(config, {})).length;

/**
 * The vault class.
 *
 * @example
 * var vault = new Vault();
 * vault.auth(some_url, some_username, some_pwd).then( => {
 *   var nb_entries = vault.getNbEntries();
 *   console.log('Success! Fetched ' + nb_entries + ' entries.');
 * });
 */
export class Vault {
    private _creds: (Credentials|undefined);
    private _tfaConfig: (TFAConfig|undefined);
    private _db: (VaultDB|undefined);
    private _crypto: (Crypto|undefined) = undefined;
    private _lastFingerprint: (string|null) = null;

    /**
     * Sets a 2-factor auth configuration to be used on each subsequent API call.
     * 
     * @param conf the config to be used for the next API calls
     */
    public setTFAConfig(conf: TFAConfig) {
        this._tfaConfig = deepCopy(conf);
    }

    /**
     * Clears the local 2-factor auth configuration
     * 
     * @see setTFAConfig
     */
    public clearTFAConfig() {
        delete this._tfaConfig;
    }


    /**
     * Asks the server to configure a new TFA secret.
     * 
     * The user should call this function, then configure a terminal with the resulting 2FA
     * secret and call {@link confirmTFASetup} with a valid 2FA PIN to validate the setup.
     * 
     * Failure to call {@link confirmTFASetup} will void the call to {@link requestTFASetup} and
     * leave no trace on the server.
     * 
     * @param cb Callback invoked on completion. err is null if no error occured.
     */
    public requestTFASetup(cb: (err: (VaultageError | null), vault: Vault, data?: TFARequestData) => void): void {
        this._setTFA(this._getCreds(), null, (err, data) => {
            let translatedData = (data == null) ? undefined : {
                provisioningURI: data.provisioning_uri
            };
            cb(err, this, translatedData);
        });
    }

    /**
     * Completes the setup of a TFA token.
     * 
     * This function should be called with a valid PIN after a successful call to {@link requestTFASetup}
     * to fininalize the 2FA setup.
     * 
     * @param cb Callback invoked on completion. err is null if no error occured.
     */
    public confirmTFASetup(data: TFAConfirmationData, cb: (err: (VaultageError | null), vault: Vault) => void): void {
        this._setTFA(this._getCreds(), data, (err) => {
            cb(err, this);
        });
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
            masterPassword: string
    ): Promise<void> {

        let creds = {
            serverURL: serverURL,
            username: username,
            localKey: 'null',
            remoteKey: 'null'
        };

        if (!this._crypto) {
            return this._pullConfig(creds).then(() => {
                // Retry auth with the crypto this time
                return this.auth(serverURL, username, masterPassword);
            });
        }

        let remoteKey = this._crypto.deriveRemoteKey(username, masterPassword);
        // possible optimization: compute the local key while the request is in the air
        let localKey = this._crypto.deriveLocalKey(username, masterPassword);

        creds.localKey = localKey;
        creds.remoteKey = remoteKey;
        return new Promise<void>((resolve, reject) => {
            this._pullCipher(creds, (err) => {
                if (!err) {
                    this._setCredentials(creds);
                    resolve();
                } else {
                    reject(err);
                }
            });
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
        // Bumping the revision on each push ensures that there are no two identical consecutive fingerprints
        // (in short we are pretending that we updated something even if we didn't)
        this._getDB().newRevision();
        this._pushCipher(this._getCreds(), null, (err) => cb(err, this));
    }

    /**
     * Un-authenticates this vault and clears the TFA configuration.
     */
    public unauth(): void {
        this.clearTFAConfig();
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
    public refresh(cb: (err: (VaultageError|null), vault: Vault) => void): void {
        this._pullCipher(this._getCreds(), (err) => cb(err, this));
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
    public updateMasterPassword(newPassword: string, cb: (err: (VaultageError|null), vault: Vault) => void): void {
        const creds = deepCopy(this._getCreds());
        const localKey = this._getCrypto().deriveLocalKey(creds.username, newPassword);
        const remoteKey = this._getCrypto().deriveRemoteKey(creds.username, newPassword);
        creds.localKey = localKey;

        this._getDB().newRevision();
        this._pushCipher(creds, remoteKey, (err) => {
            if (!err) {
                if (!this._creds) {
                    cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'), this);
                } else {
                    creds.remoteKey = remoteKey;
                    this._setCredentials(creds);
                }
            }
            cb(err, this)
        });
    }

    /**
     * Gets the number of entries in the db.
     * @return {number} the number of entries in the db.
     * @throws If this vault is not authenticated.
     */
    public getNbEntries(): number {
        return this._getDB().size();
    }

    /**
     * Adds a new entry in the db
     */
    public addEntry(attrs: VaultDBEntryAttrs): void {
        this._getDB().add(attrs);
    }

    /**
     * Deletes an entry
     */
    public removeEntry(id: string): void {
        this._getDB().remove(id);
    }

    /**
     * Returns the set of entries matching the specified query
     * @param query attribute substrings to match
     */
    public findEntries(query: string): VaultDBEntry[] {
        return this._getDB().find(query);
    }

    /**
     * Returns the set of all entries in the DB
     */
    public getAllEntries(): VaultDBEntry[] {
        return this.findEntries('');
    }

    /**
     * Edits an entry in the vault.
     *
     * @param id Id of the entry to edit
     * @param attrs new set of attributes. undefined values are ignored (the entry keeps its previous value)
     * @returns an updated version of the entry
     */
    public updateEntry(id: string, attrs: VaultDBEntryAttrs): VaultDBEntry {
        this._getDB().update(id, attrs);
        return this._getDB().get(id);
    }

    /**
     * Returns an entry by its id
     */
    public getEntry(id: string): VaultDBEntry {
        return this._getDB().get(id);
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


    // Visible for tests only

    public _setCrypto(crypto: Crypto): void {
        this._crypto = crypto;
    }

    public _getCrypto(): Crypto {
        if (!this._crypto) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated');
        }
        return this._crypto;
    }

    public _setDB(db: VaultDB): void {
        this._db = db;
    }

    public _getDB(): VaultDB {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db;
    }

    public _getCreds(): Credentials {
        if (!this._creds) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._creds;
    }

    public _setCreds(creds: Credentials): void {
        this._creds = creds;
    }

    public _request(): request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl> {
        return request;
    }

    public _VaultDB(): typeof VaultDB {
        return VaultDB;
    }


    // Private methods

    private _pullConfig(creds: Credentials): Promise<void> {
        return new Promise<request.RequestResponse>(resolve => {
            this._request()({
                url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey, 'config')
            }, (err: any, resp) => {
                if (err) {
                    throw new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString());
                } else {
                    return resolve(resp);
                }
            });
        }).then((resp) => {
            return new Promise<void>(resolve => {
                let body: any;
                try {
                    body = JSON.parse(resp.body);
                    // Poor man's typechecking of the server response
                    if (!body.salts || body.salts.USERNAME_SALT == null) {
                        throw "Parse error";
                    }
                } catch(e) {
                    throw new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response');
                }

                this._setCrypto(new Crypto(config, body.salts));
                resolve();
            });
        });
    }

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
        this._request()({
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey, 'pull')
        }, (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
            }

            let body: any;
            try {
                body = JSON.parse(resp.body);
            } catch(e) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response'));
            }
            if (!this._crypto) {
                return cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
            }
            if (body.error != null && body.error === true) {
                if (body.tfa_error) {
                    return cb(new VaultageError(ERROR_CODE.TFA_FAILED, 'Two-step authentication failed.'));
                } else {
                    return cb(new VaultageError(ERROR_CODE.BAD_REMOTE_CREDS, 'Wrong username / remote password (or DB link inactive).'));
                }
            }

            let cipher = (body.data || '').replace(/[^a-z0-9+/:"{},]/ig, '');

            if (cipher && body.data) {
                try {
                    let plain = this._crypto.decrypt(creds.localKey, cipher);
                    this._db = this._VaultDB().deserialize(config, plain);
                    this._lastFingerprint = this._crypto.getFingerprint(plain, creds.localKey);
                } catch (e) {
                    return cb(new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occured while decrypting the cipher', e));

                }
            } else {
                // Create an empty DB if there is nothing on the server.
                this._setDB(new (this._VaultDB())(config, {}));
                this._lastFingerprint = '';
            }
            cb(null);
        });
    }

    private _pushCipher(creds: Credentials, newRemoteKey: (string|null), cb: (err: (VaultageError|null)) => void): void {
        let plain = VaultDB.serialize(this._getDB());
        let cipher = this._getCrypto().encrypt(creds.localKey, plain);
        let fingerprint = this._getCrypto().getFingerprint(plain, creds.localKey);
        let action = newRemoteKey == null ? 'push' : 'changekey';
        this._request()({
            method: 'POST',
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey, action),
            body: urlencode({
                'update_key': newRemoteKey,
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

            let body: any;
            try {
                body = JSON.parse(resp.body);
            } catch(e) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response'));
            }
            if (body.error != null && body.error === true) {
                if (body.not_fast_forward === true) {
                    return cb(new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, 'The server has a newer version of the DB'));
                } else if (body.tfa_error) {
                    cb(new VaultageError(ERROR_CODE.TFA_FAILED, 'Two-step authentication failed.'));
                } else {
                    return cb(new VaultageError(ERROR_CODE.BAD_REMOTE_CREDS, 'Wrong username / remote password (or DB link inactive).'));
                }
            }
            this._lastFingerprint = fingerprint;
            cb(null);
        });
    }

    private _setTFA(creds: Credentials, confirm: (TFAConfirmationData|null), cb: (err: (VaultageError|null), data?: any) => void): void {
        this._request()({
            method: 'POST',
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey, 'settfa'),
            body: urlencode({
                method: 'totp',
                confirm: (confirm) ? confirm.pin : null
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
                if (body.tfa_error) {
                    return cb(new VaultageError(ERROR_CODE.TFA_FAILED, 'Two-step authentication failed.'));
                } else if (confirm) {
                    return cb(new VaultageError(ERROR_CODE.TFA_CONFIRM_FAILED, 'Invalid confirmation pin'));
                } else {
                    return cb(new VaultageError(ERROR_CODE.BAD_REMOTE_CREDS, 'Wrong username / remote password (or DB link inactive).'));
                }
            }
            cb(null, body.data);
        });
    }

    private _makeURL(serverURL: string, username: string, remotePwdHash: string, action: string): string {
        let url = `${serverURL}/${username}/${remotePwdHash}/${action}`; //do is just for obfuscation
        if (this._tfaConfig) {
            url += `?tfa_method=${encodeURIComponent(this._tfaConfig.method)}&tfa_request=${encodeURIComponent(this._tfaConfig.request)}`;
        }
        return url;
    }
}