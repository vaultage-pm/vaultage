import { checkParams, deepCopy, guid, GUID } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';



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
            private _entries: { [key: string]: VaultDBEntry },
            private _revision: number = 0) {
    }

    public static serialize(db: VaultDB): string {
        const entries = db.getAll();

        let serialized = JSON.stringify({
            entries: entries,
            v: VaultDB.VERSION,
            r: db._revision
        });

        return serialized;
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

    /**
     * Returns a deep-copy of all DB entries
     */
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