import { Config } from './Config';
import { checkParams, deepCopy, guid, GUID } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';



export interface VaultDBEntryAttrs {
    title?: string;
    url?: string;
    login?: string;
    password?: string;
    usageCount: number;
    reUseIndex?: number;
}

export interface VaultDBEntry {
    title: string,
    url: string,
    login: string,
    password: string,
    usageCount: number,
    reUseIndex: number,
    id: GUID,
    created: string,
    updated: string
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
 * Internal class for handling the vault data.
 *
 * Exposed solely for debugging purpose.
 */
export class VaultDB {
    private static VERSION: number = 0;

    public constructor(
            private _config: Config,
            private _entries: { [key: string]: VaultDBEntry },
            private _revision: number = 0,
            private _reuseTable: { [id: string]: number } = {} ) {
    }

    public static serialize(db: VaultDB): string {
        const entries = db.getAll();
        const n_entries = entries.length;
        const expectedLength = n_entries * db._config.BYTES_PER_ENTRY + db._config.MIN_DB_LENGTH;

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

    public static deserialize(config: Config, ser: string): VaultDB {
        const data = JSON.parse(ser);
        const entries: {
            [key: string]: VaultDBEntry
        } = {};
        //the reUse table (check which passwords are used multiple times)
        const reuseTable: {
            [id: string]: number
        } = {}

        for (var entry of data.entries) {
            if (entries[entry.id] != null) {
                throw new VaultageError(ERROR_CODE.DUPLICATE_ENTRY, 'Duplicate entry with id: ' + entry.id + ' in vault.');
            }
            entries[entry.id] = entry;

            //init to 0 if unset
            if (reuseTable[entry.password] == null){
                reuseTable[entry.password] = 0
            }
            reuseTable[entry.password]++
        }

        return new VaultDB(config, entries, data._revision, reuseTable);
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
            usageCount: 0,
            reUseIndex: 0,
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

    public entryUsed(id: string): void {
        let entry = this.get(id);
        let newCount = entry.usageCount + 1
        this._entries[entry.id].usageCount = newCount
    }

    public update(entry: VaultDBEntry): void;
    public update(id: string, attrs: VaultDBEntryAttrs): void;
    public update(id: (string | VaultDBEntry), attrs?: VaultDBEntryAttrs): void {
        if (typeof id !== 'string') {
            attrs = {
                title: '',
                url: '',
                login: '',
                password: '',
                usageCount: 0,
                reUseIndex: 0,
            };
            attrs = checkParams(id, attrs);
            id = id.id;
        }

        // This is only needed due to typescript's inability to correlate the input
        // arguments based on the prototypes. In practice this branch is never taken.
        if (attrs == null) attrs = { usageCount: 0, reUseIndex: 0 };

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
        entry.reUseIndex = this._reuseTable[entry.password];
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
                let entry2 = deepCopy(entry)
                entry2.reUseIndex = this._reuseTable[entry2.password];
                resultSet.push(entry2);
            }
        }

        return resultSet;
    }

    public getAll(): VaultDBEntry[] {
        const entries: VaultDBEntry[] = [];
        const keys = Object.keys(this._entries);
        for (var key of keys) {
            let entry2 = deepCopy(this._entries[key])
            entry2.reUseIndex = this._reuseTable[entry2.password];
            entries.push(entry2);
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