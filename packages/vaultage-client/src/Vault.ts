import { Crypto } from './Crypto';
import { HttpApi } from './HTTPApi';
import { IHttpParams, IVaultDBEntry, IVaultDBEntryAttrs, PasswordStrength } from './interface';
import { deepCopy } from './utils';
import { VaultDB } from './VaultDB';
import { VaultageError, ERROR_CODE } from './VaultageError';

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
    private _httpParams?: IHttpParams;
    private _lastFingerprint?: string;
    private _isServerInDemoMode: boolean;

    constructor(creds: ICredentials, crypto: Crypto, cipher: string | undefined, httpParams?: IHttpParams, demoMode?: boolean) {
        this._creds = { ...creds };
        this._crypto = crypto;
        this._db = new VaultDB({});
        this._httpParams = httpParams;
        this._isServerInDemoMode = false;
        if (demoMode === true) {
            this._isServerInDemoMode = true;
        }
        if (cipher) {
            this._setCipher(creds, cipher);
        }
    }

    /**
     * Returns the username associated with this Vault.
     */
    public get username(): string {
        return this._creds.username;
    }

    /**
     * Returns the server URL associated with this Vault.
     */
    public get serverURL(): string {
        return this._creds.serverURL;
    }

    public getDBRevision(): number {
        if (!this._db) {
            return -1;
        }
        return this._db.getRevision();
    }


    /**
     * Saves the Vault on the server.
     * @throws if the server is in demo-mode, the UI should not try to call "save".
     *
     * The vault must be authenticated before this method can be called.
     */
    public save(): Promise<void> {
        // Bumping the revision on each push ensures that there are no two identical consecutive fingerprints
        // (in short we are pretending that we updated something even if we didn't)
        this._db.newRevision();

        // if in demo mode, we never push to the server
        if (this._isServerInDemoMode) {
            // we do not throw the error, this forces too many checks on the UI. We just pretend it worked
            // throw new VaultageError(ERROR_CODE.DEMO_MODE, 'Server in demo mode');
            return new Promise((resolve, _) => { resolve(); });
        }
        return this._pushCipher(this._creds, null);
    }

    /**
     * Refreshes the local data by pulling the latest cipher from the server.
     *
     * The vault must be authenticated before this method can be called.
     */
    public pull(): Promise<void> {
        return this._pullCipher(this._creds);
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
    public async updateMasterPassword(newPassword: string): Promise<void> {
        const newCredentials = deepCopy(this._creds);
        const newLocalKey = this._crypto.deriveLocalKey(newPassword);
        const newRemoteKey = this._crypto.deriveRemoteKey(newPassword);

        this._db.newRevision();

        // first, let's do a request with (oldRemoteKey, newLocalKey), and provide new_password=newRemoteKey.
        // This will encrypt the cipher with the newLocalKey, instruct the server to use newRemoteKey for the
        // *** subsequent *** updates; of course, this message is still authenticated with oldRemoteKey
        newCredentials.localKey = newLocalKey;

        await this._pushCipher(newCredentials, newRemoteKey);


        // at this point, the server accepted the update. Let's confirm it by trying to pull with the new
        // accesses

        newCredentials.remoteKey = newRemoteKey;
        await this._pullCipher(newCredentials);

        // everything went fine, now we use the new credentials
        newCredentials.remoteKey = newRemoteKey;
        this._setCredentials(newCredentials);
    }

    /**
     * Gets the number of entries in the db.
     * @returns {number} the number of entries in the db.
     * @throws If this vault is not authenticated.
     */
    public getNbEntries(): number {
        return this._db.size();
    }

    /**
     * Adds a new entry in the db
     * @returns the id of the newly created entry
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
        return this._db.getEntriesWhichReusePasswords();
    }

    /**
     * Edits an entry in the vault.
     *
     * @param id Id of the entry to edit
     * @param attrs new set of attributes. undefined values are ignored (the entry keeps its previous value)
     * @returns an updated version of the entry
     */
    public updateEntry(id: string, attrs: Partial<IVaultDBEntryAttrs>): IVaultDBEntry {
        this._db.update(id, attrs);
        return this._db.get(id);
    }

    /**
     * Returns an entry by its id
     */
    public getEntry(id: string): IVaultDBEntry {
        return this._db.get(id);
    }

    /**
     * Replaces the current entries with the new set of provided entries.
     * Then, manually "push" to overwrite the remote database's ciphertext, or "pull" to cancel this import
     * @param entries The entries to replace this db's entries
     */
    public replaceAllEntries(entries: IVaultDBEntry[]) {
        return this._db.replaceAllEntries(entries);
    }

    /**
     * Returns true if the "demo" flag has been set on the server. This means that typically some operations will be restricted, or
     * that the UI should indicate that the DB is reset periodically, etc.
     */
    public isInDemoMode(): boolean {
        return this._isServerInDemoMode;
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

    private async _pullCipher(creds: ICredentials): Promise<void> {
        const cipher = await HttpApi.pullCipher(creds, this._httpParams);
        if (cipher) {
            this._setCipher(creds, cipher);
        } else {
            // Create an empty DB if there is nothing on the server.
            this._db = new VaultDB({});
            this._lastFingerprint = '';
        }
    }

    private async _pushCipher(creds: ICredentials, newRemoteKey: (string|null)): Promise<void> {
        const plain = VaultDB.serialize(this._db);
        const cipher = this._crypto.encrypt(creds.localKey, plain);
        const fingerprint = this._crypto.getFingerprint(plain, creds.localKey);

        try {
            await HttpApi.pushCipher(
                creds,
                newRemoteKey,
                cipher,
                this._lastFingerprint,
                fingerprint,
                this._httpParams);
        } catch (exception) {
            if (exception.code === ERROR_CODE.NOT_FAST_FORWARD) {
                console.log('Push is not fast-forward, attempting merge...');
                this._merge(creds);
            } else {
                // not our concern, continue throwing
                throw exception;
            }
        }

        this._lastFingerprint = fingerprint;
    }

    private async _merge(creds: ICredentials): Promise<void> {
        const clientEntries = this._db.getAll();
        const oldCipher = await HttpApi.pullCipher(creds, this._httpParams);
        const oldPlain = this._crypto.decrypt(creds.localKey, oldCipher);
        const serverEntries = VaultDB.deserialize(oldPlain).getAll();

        const arrayToMap = (array: IVaultDBEntry[]) => {
            const map = new Map<string, IVaultDBEntry>();
            for(const entry of array) {
                map.set(entry.id, entry);
            }
            return map;
        }

        const clientEntriesMap = arrayToMap(clientEntries);
        const serverEntriesMap = arrayToMap(serverEntries);

        const entriesArePerfectlyEqual = (e1: IVaultDBEntry, e2: IVaultDBEntry) => {
            return entriesAreSemanticallyEqual(e1, e2) &&
            (e1.created === e2.created) &&
            (e1.updated === e2.updated) &&
            (e1.usage_count === e2.usage_count) &&
            (e1.reuse_count === e2.reuse_count) &&
            (e1.hidden === e2.hidden)
        }

        const entriesAreSemanticallyEqual = (e1: IVaultDBEntry, e2: IVaultDBEntry) => {
            return (e1.id === e2.id) &&
            (e1.title === e2.title) &&
            (e1.url === e2.url) &&
            (e1.login === e2.login) &&
            (e1.password === e2.password)
            // do not compare usage count, etc
        }

        const mergeEntries = (e1: IVaultDBEntry, e2: IVaultDBEntry): IVaultDBEntry => {
            if(!entriesAreSemanticallyEqual(e1, e2)) {
                throw new Error('Something went terribly wrong; can\'t merge: ' + JSON.stringify([e1, e2]));
            }
            const result: IVaultDBEntry = JSON.parse(JSON.stringify(e1))
            result.usage_count = Math.max(e1.usage_count, e2.usage_count)
            result.reuse_count = Math.max(e1.reuse_count, e2.reuse_count)
            return result
        }

        // find differences
        const newClientEntries: IVaultDBEntry[] = [];
        const newServerEntries: IVaultDBEntry[] = [];
        const commonEntries: IVaultDBEntry[] = [];

        const mergedEntries: IVaultDBEntry[] = [];
        type VaultTuple = [IVaultDBEntry, IVaultDBEntry]; // client version, server version
        const nonMergedEntries: VaultTuple[] = [];

        for(const entry of clientEntries) {
            if(!serverEntriesMap.has(entry.id)) {
                newClientEntries.push(entry);
            }
            commonEntries.push(entry);
        }
        for(const entry of serverEntries) {
            if(!serverEntriesMap.has(entry.id)) {
                newServerEntries.push(entry);
            }
        }

        for(const clientEntry of commonEntries) {
            const serverEntry = serverEntriesMap.get(clientEntry.id);
            if (serverEntry === undefined) {
                throw new Error('Something went terribly wrong in the comparison.')
            }
            if(!entriesArePerfectlyEqual(clientEntry, serverEntry)) {
                if(entriesAreSemanticallyEqual(clientEntry, serverEntry)) {
                    mergedEntries.push(mergeEntries(clientEntry, serverEntry))
                } else {
                    nonMergedEntries.push([clientEntry, serverEntry]);
                }
            }
        }

        if(nonMergedEntries.length > 0) {
            throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, 'The server has a newer version of the DB, couldn\'t merge automatically');
        }

        // HERE

        console.log('New Server Entries:')
        for(const e of newServerEntries) {
            console.log(JSON.stringify(e))
        }

        console.log('Entries automatically merged:')
        for(const e of mergedEntries) {
            console.log(JSON.stringify(e))
        }
    }

    private _setCipher(creds: ICredentials, cipher: string): void {
        const plain = this._crypto.decrypt(creds.localKey, cipher);
        this._db = VaultDB.deserialize(plain);
        this._lastFingerprint = this._crypto.getFingerprint(plain, creds.localKey);
    }
}
