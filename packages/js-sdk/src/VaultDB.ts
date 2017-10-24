import { Config } from './Config';
import { checkParams, deepCopy, fixedLength, guid, GUID, QueryUtils } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';


export interface SerializedVaultDB_v1 {
    entries: VaultDBEntry[],
    v: string,
    r: string
};

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

export interface VaultDBEntries {
    [key: string]: VaultDBEntry;
}

/**
 * Internal class for handling the vault data.
 *
 * Exposed solely for debugging purpose.
 */
export class VaultDB {
    private static VERSION: number = 0;

    public constructor(
            private _config: Config,
            private _entries: VaultDBEntries,
            private _revision: number = 0) {
    }

    public static serialize(db: VaultDB): string {
        const entries = db.getAll();
        const n_entries = entries.length;
        const expectedLength = n_entries * db._config.BYTES_PER_ENTRY + db._config.MIN_DB_LENGTH;

        let dto: SerializedVaultDB_v1 = {
            entries: entries,
            v: fixedLength(VaultDB.VERSION, 3),
            r: fixedLength(db._revision, 7)
        };
        let serialized = JSON.stringify(dto);

        const amountToPad = expectedLength - serialized.length;
        let pad = "";
        for (let i = 0 ; i < amountToPad ; i++) {
            pad += " ";
        }

        // Padding with spaces does not affect the encoded data since it's JSON but
        // it does change the cipher length.
        return serialized + pad;
    }

    public static deserialize(config: Config, ser: string): VaultDB {
        const data = JSON.parse(ser) as SerializedVaultDB_v1;
        const entries: {
            [key: string]: VaultDBEntry
        } = {};

        const version = parseInt(data.v, 10);
        if (version !== VaultDB.VERSION) {
            throw new VaultageError(ERROR_CODE.DB_ERROR, 'Wrong DB version: ' + version + '. expected ' + VaultDB.VERSION);
        }

        for (var entry of data.entries) {
            if (entries[entry.id] != null) {
                throw new VaultageError(ERROR_CODE.DUPLICATE_ENTRY, 'Duplicate entry with id: ' + entry.id + ' in vault.');
            }
            entries[entry.id] = entry;
        }

        return new VaultDB(config, entries, parseInt(data.r, 10));
    }

    /**
     * Adds a new entry to the database.
     * 
     * @param attrs Entry attributes
     * @return the generated id for that entry
     */
    public add(attrs: VaultDBEntryAttrs): string {
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
        return entry.id;
    }

    public remove(id: string): void {
        if (this._entries[id] == null) {
            throw new VaultageError(ERROR_CODE.NO_SUCH_ENTRY, 'No entry with id "' + id + '"');
        }
        delete this._entries[id];
        this.newRevision();
    }

    /**
     * Updates an entry in the DB.
     * 
     * You can either pass a full VaultDBEntry (with an id) or an id and some VaultDBEntryAttrs.
     */
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