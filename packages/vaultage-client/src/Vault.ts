import { Crypto } from './Crypto';
import { HttpApi } from './HTTPApi';
import { PasswordStrength } from './Passwords';
import { deepCopy } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';
import { IVaultDBEntry, IVaultDBEntryAttrs, VaultDB } from './VaultDB';

export interface ICredentials {
    localKey: string;
    remoteKey: string;
    serverURL: string;
    username: string;
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
    private _creds: ICredentials;
    private _crypto: Crypto;
    private _db: VaultDB;
    private _lastFingerprint?: string;

    constructor(creds: ICredentials, crypto: Crypto, cipher?: string) {
        this._creds = { ...creds };
        this._crypto = crypto;
        this._db = new VaultDB({});
        if (cipher) {
            this._setCipher(creds, cipher);
        }
    }

    public getDBRevision(): number {
        if (!this._db) {
            return -1;
        }
        return this._db.getRevision();
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
        if (!this._creds || !this._db || !this._crypto) {
            cb(new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated'));
        } else {
            const oldCredentials = deepCopy(this._creds);
            const newCredentials = deepCopy(this._creds);
            const newLocalKey = this._crypto.deriveLocalKey(newPassword);
            const newRemoteKey = this._crypto.deriveRemoteKey(newPassword);

            this._db.newRevision();

            // first, let's do a request with (oldRemoteKey, newLocalKey), and provide new_password=newRemoteKey.
            // This will encrypt the cipher with the newLocalKey, instruct the server to use newRemoteKey for the
            // *** subsequent *** updates; of course, this message is still authenticated with oldRemoteKey
            newCredentials.localKey = newLocalKey;

            this._pushCipher(newCredentials, newRemoteKey, (err) => {
                if (err) {
                    this._setCredentials(oldCredentials);
                }
                cb(err);
            });

            // at this point, the server accepted the update. Let's confirm it by trying to pull with the new
            // accesses

            this._pullCipher(newCredentials, (err) => {
                cb(new VaultageError(ERROR_CODE.SERVER_ERROR,
                        'Something went terribly wrong; the server accepted the key update, but the new key does not work !' + err));
            });

            // everything went fine, now we use the new credentials
            newCredentials.remoteKey = newRemoteKey;
            this._creds = newCredentials;
        }
    }

    /**
     * Gets the number of entries in the db.
     * @return {number} the number of entries in the db.
     * @throws If this vault is not authenticated.
     */
    public getNbEntries(): number {
        return this._db.size();
    }

    /**
     * Adds a new entry in the db
     */
    public addEntry(attrs: IVaultDBEntryAttrs): string {
        return this._db.add(attrs);
    }

    /**
     * Records that one entry has been used (for usage_count statistics)
     * @returns the new usage count
     */
    public entryUsed(id: string): number {
        return this._db.entryUsed(id);
    }

    /**
     * Deletes an entry
     */
    public removeEntry(id: string): void {
        this._db.remove(id);
    }

    /**
     * Returns the set of entries matching the specified query
     * @param query attribute substrings to match
     */
    public findEntries(...query: string[]): IVaultDBEntry[] {
        return this._db.find(...query);
    }

    /**
     * Returns all weak passwords in the DB
     * @param threshold the threshold below which an entry is returned
     */
    public getWeakPasswords(threshold: PasswordStrength = PasswordStrength.WEAK): IVaultDBEntry[] {
        const entries = this.getAllEntries();
        return entries.filter((e) => e.password_strength_indication <= threshold);
    }

    /**
     * Returns the set of all entries in the DB
     */
    public getAllEntries(): IVaultDBEntry[] {
        return this.findEntries('');
    }

    /**
     * Returns the set of all entries in the DB
     */
    public getEntriesWhichReusePasswords(): IVaultDBEntry[] {
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
    public updateEntry(id: string, attrs: IVaultDBEntryAttrs): IVaultDBEntry {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        this._db.update(id, attrs);
        return this._db.get(id);
    }

    /**
     * Returns an entry by its id
     */
    public getEntry(id: string): IVaultDBEntry {
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
    public replaceAllEntries(entries: IVaultDBEntry[]) {
        if (!this._db) {
            throw new VaultageError(ERROR_CODE.NOT_AUTHENTICATED, 'This vault is not authenticated!');
        }
        return this._db.replaceAllEntries(entries);
    }


    // Private methods
    private _setCredentials(creds: ICredentials): void {
        // Copy for immutability
        this._creds = {
            serverURL: creds.serverURL,
            username: creds.username,
            localKey: creds.localKey,
            remoteKey: creds.remoteKey
        };
    }

    private _pullCipher(creds: ICredentials, cb: (err: (VaultageError|null)) => void): void {
        HttpApi.pullCipher(creds, (err, cipher) => {
            if (cipher) {
                const err2 = this._setCipher(creds, cipher);
                if (err2) {
                    return cb(err2);
                }
            } else {
                // Create an empty DB if there is nothing on the server.
                this._db = new VaultDB({});
                this._lastFingerprint = '';
            }
            cb(err);
        });

    }

    private _pushCipher(creds: ICredentials, newRemoteKey: (string|null), cb: (err: (VaultageError|null)) => void): void {
        const plain = VaultDB.serialize(this._db);
        const cipher = this._crypto.encrypt(creds.localKey, plain);
        const fingerprint = this._crypto.getFingerprint(plain, creds.localKey);

        HttpApi.pushCipher(
            creds,
            newRemoteKey,
            cipher,
            this._lastFingerprint,
            fingerprint, (err) => {
                if (err) {
                    return cb(err);
                }
                this._lastFingerprint = fingerprint;
        });
    }

    private _setCipher(creds: ICredentials, cipher: string): undefined | VaultageError {
        try {
            const plain = this._crypto.decrypt(creds.localKey, cipher);
            this._db = VaultDB.deserialize(plain);
            this._lastFingerprint = this._crypto.getFingerprint(plain, creds.localKey);
            return;
        } catch (e) {
            return new VaultageError(ERROR_CODE.CANNOT_DECRYPT, 'An error occurred while decrypting the cipher', e);
        }
    }
}
