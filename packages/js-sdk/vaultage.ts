import * as request from 'request';
import * as _sjcl from './sjcl';

// sjcl has no typing
let sjcl = _sjcl as any;

export enum ERROR_CODE {
    NOT_AUTHENTICATED = 1,
    BAD_REMOTE_CREDS,
    CANNOT_DECRYPT,
    NETWORK_ERROR,
    NOT_FAST_FORWARD,
    DUPLICATE_ENTRY,
    NO_SUCH_ENTRY
};

export type GUID = string;

export interface VaultDBEntryAttrs {
    title?: string;
    url?: string;
    login?: string;
    password?: string;
}

export interface VaultDBEntry {
    title: string,
    url: string,
    login: string,
    password: string,
    id: GUID,
    created: string,
    updated: string
}

export interface Credentials {
    localKey: string;
    remoteKey: string;
    serverURL: string;
    username: string;
}

/**
 * Utilities for performing queries in the DB
 */
abstract class QueryUtils {

    public static stringContains(entry: string, criteria?: string): boolean {
        return criteria == null || entry.indexOf(criteria) !== -1;
    }
}

/**
 * Class for errors coming from the Vaultage lib.
 * @constructor
 * 
 * @member {number} code Code as defined in Vaultage.ERROR_CODES. Rely on this when processing the error.
 * @member {string} message Human readable error message. Do not rely on this when processing the error.
 * @member {?Error} cause Exception causing this error
 */
export class VaultageError extends Error{
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
            private _entries: { [key: string]: VaultDBEntry },
            private _revision: number = 0) {
    }

    public static serialize(db: VaultDB): string {
        const entries = db.getAll();
        const n_entries = entries.length;
        const expectedLength = n_entries * BYTES_PER_ENTRY + MIN_DB_LENGTH;

        let serialized = JSON.stringify({
            entries: entries,
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
        const entries: {
            [key: string]: VaultDBEntry
        } = {};

        for (var entry of data.entries) {
            if (entries[entry.id] != null) {
                throw new VaultageError(ERROR_CODE.DUPLICATE_ENTRY, 'Duplicate entry with id: ' + entry.id + ' in vault.');
            }
            entries[entry.id] = entry;
        }

        return new VaultDB(entries, data._revision);
    }

    public add(attrs: VaultDBEntryAttrs): void {
        let checkedAttrs = {
            title: '',
            url: '',
            login: '',
            password: ''
        };
        checkedAttrs = checkParams(attrs, checkedAttrs);
        let currentDate = (new Date()).toUTCString();
        let entry: VaultDBEntry = {
            id: guid(),
            title: checkedAttrs.title,
            url: checkedAttrs.url,
            login: checkedAttrs.login,
            password: checkedAttrs.password,
            created: currentDate,
            updated: currentDate
        };
        this._entries[entry.id] = entry;
        this.newRevision();
    }

    public remove(id: string): void {
        if (this._entries[id] == null) {
            throw new VaultageError(ERROR_CODE.NO_SUCH_ENTRY, 'No entry with id "' + id + '"');
        }
        delete this._entries[id];
        this.newRevision();
    }

    public update(entry: VaultDBEntry): void;
    public update(id: string, attrs: VaultDBEntryAttrs): void;
    public update(id: (string | VaultDBEntry), attrs?: VaultDBEntryAttrs): void {
        if (typeof id !== 'string') {
            attrs = {
                title: '',
                url: '',
                login: '',
                password: ''
            };
            attrs = checkParams(id, attrs);
            id = id.id;
        }

        // This is only needed due to typescript's inability to correlate the input
        // arguments based on the prototypes. In practice this branch is never taken.
        if (attrs == null) attrs = {};

        let currentDate = (new Date()).toUTCString();
        let entry = this.get(id);

        if (attrs.login) entry.login = attrs.login;
        if (attrs.password) entry.password = attrs.password;
        if (attrs.title) entry.title = attrs.title;
        if (attrs.url) entry.url = attrs.url;
        entry.updated = currentDate;

        this._entries[entry.id] = entry;
        this.newRevision();
    }

    public get(id: string): VaultDBEntry {
        let entry = this._entries[id];
        if (entry == null) {
            throw new VaultageError(ERROR_CODE.NO_SUCH_ENTRY, 'No entry with id "' + id + '"');
        }
        return deepCopy(entry);
    }

    public find(query: string): VaultDBEntry[] {
        let keys = Object.keys(this._entries);
        let resultSet: VaultDBEntry[] = [];

        for (let key of keys) {
            let entry = this._entries[key];
            if (    QueryUtils.stringContains(entry.login, query) ||
                    QueryUtils.stringContains(entry.id, query) ||
                    QueryUtils.stringContains(entry.title, query) ||
                    QueryUtils.stringContains(entry.url, query)) {
                resultSet.push(deepCopy(entry));
            }
        }

        return resultSet;
    }

    public getAll(): VaultDBEntry[] {
        const entries: VaultDBEntry[] = [];
        const keys = Object.keys(this._entries);
        for (var key of keys) {
            entries.push(deepCopy(this._entries[key]));
        }
        return entries;
    }

    /**
     * Returns the number of entries in this DB.
     */
    public size(): number {
        return Object.keys(this._entries).length;
    }

    /**
     * Bumps the revision number of this DB.
     */
    public newRevision(): void {
        this._revision ++;
    }
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
        // We convert the master password to a fixed length using sha256 then use the first half
        // of that result for creating the local key. 
        // Since we use the second half for the remote key and there is no way to derive the first half
        // of a hash given its second half, then **even if** the remote key leaks AND pbkdf2 is found
        // to be reversible, we still cannot find the local key.
        let masterHash = sjcl.hash.sha512.hash(masterPassword);
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterHash.slice(0, 8) , localSalt, PBKF2_DIFFICULTY));
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
        let masterHash = sjcl.hash.sha512.hash(masterPassword);
        let result = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(masterHash.slice(8, 16), remoteSalt, PBKF2_DIFFICULTY));
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
     * Used to prove to our past-self that we have access to the local key and the latest
     * vault's plaintext and and challenge our future-self to do the same.
     * 
     * @param plain the serialized vault's plaintext
     * @param localKey the local key
     * @param username the username is needed to salt the fingerprint
     */
    public static getFingerprint(plain: string, localKey: string): string {
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
        return sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(plain, localKey, PBKF2_DIFFICULTY));
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
            this._pushCipher(this._creds, null, (err) => cb(err, this));
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
    public refresh(cb: (err: (VaultageError|null), vault: Vault) => void): void {
        if (!this._creds) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'), this);
        } else {
            this._pullCipher(this._creds, (err) => cb(err, this));
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
    public updateMasterPassword(newPassword: string, cb: (err: (VaultageError|null), vault: Vault) => void): void {
        if (!this._creds || !this._db) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated'), this);
        } else {
            let localKey = Crypto.deriveLocalKey(this._creds.username, newPassword);
            let remoteKey = Crypto.deriveRemoteKey(this._creds.username, newPassword);
            let creds = deepCopy(this._creds);
            creds.localKey = localKey;

            this._db.newRevision();
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
    public addEntry(attrs: VaultDBEntryAttrs): void {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        this._db.add(attrs);
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
    public findEntries(query: string): VaultDBEntry[] {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.find(query);
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
            url: makeURL(creds.serverURL, creds.username, creds.remoteKey, 'pull')
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
                    this._lastFingerprint = Crypto.getFingerprint(plain, creds.localKey);
                } catch (e) {
                    cb(new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occured while decrypting the cipher', e));
                    return;
                }
            } else {
                // Create an empty DB if there is nothing on the server.
                this._db = new VaultDB({});
            }
            cb(null);
        });
    }

    private _pushCipher(creds: Credentials, newRemoteKey: (string|null), cb: (err: (VaultageError|null)) => void): void {
        if (this._db == undefined) {
            return cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!'));
        }

        let plain = VaultDB.serialize(this._db);
        let cipher = Crypto.encrypt(creds.localKey, plain);
        let fingerprint = Crypto.getFingerprint(plain, creds.localKey);
        let action = newRemoteKey == null ? 'push' : 'changekey';
        request({
            method: 'POST',
            url: makeURL(creds.serverURL, creds.username, creds.remoteKey, action),
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
            let body = JSON.parse(resp.body);
            if (body.error != null && body.error === true) {
                if (body.not_fast_forward === true) {
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

function makeURL(serverURL: string, username: string, remotePwdHash: string, action: string): string {
    return serverURL + '/' + username + '/' + remotePwdHash + '/' + action; //do is just for obfuscation
}

function urlencode(data: any): string {
    let ret: string[] = [];
    let keys = Object.keys(data);
    for (var key of keys) {
        if (data[key] != null) {
            ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
    }
    return ret.join('&');
}

/**
 * Asserts that data has at least all the properties of ref and returns an object containing the keys of
 * ref with the non-null values of data.
 * 
 * This can be used to convert object with optional properties into objects with non-null properties
 * at runtime.
 * 
 * @param data object to be checked
 * @param ref The reference whose keys are used for checking
 */
function checkParams<T>(data: any, ref: T): T {
    let ret: any = {};
    let properties = Object.keys(ref);
    for (var prop of properties) {
        if (data[prop] == null) {
            throw new Error('Missing property: ' + prop);
        }
        ret[prop] = data[prop];
    }
    return ret;
}

/**
 * Creates a good-enough probably unique id.
 */
function guid(): GUID {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


function deepCopy<T>(source: T): T {
    // Probably one of the most inefficient way to perform a deep copy but at least it guarantees isolation,
    // is short and easy to understand, and works as long as we dont mess with non-primitive types
    return JSON.parse(JSON.stringify(source));
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
export var MIN_DB_LENGTH = VaultDB.serialize(new VaultDB({})).length;
