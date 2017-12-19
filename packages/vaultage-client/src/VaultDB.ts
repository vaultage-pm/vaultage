import { Passwords, PasswordStrength } from './Passwords';
import { checkParams, deepCopy } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';


export interface IVaultDBEntryAttrs {
    title?: string;
    url?: string;
    login?: string;
    password?: string;
}

export interface IVaultDBEntry {
    title: string;
    url: string;
    login: string;
    password: string;
    id: string;
    created: string;
    updated: string;
    usage_count: number;
    reuse_count: number;
    password_strength_indication: PasswordStrength;
    hidden: boolean;
}

/**
 * Internal class for handling the vault data.
 *
 * Exposed solely for debugging purpose.
 */
export class VaultDB {

    public static serialize(db: VaultDB): string {
        const entries = db.getAll();

        const serialized = JSON.stringify({
            entries: entries,
            version: VaultDB.VERSION,
            revision: db._revision
        });

        return serialized;
    }

    public static deserialize(json: string): VaultDB {

        const entries: {
            [key: string]: IVaultDBEntry
        } = {};

        // return empty DB
        if (json === '') {
            return new VaultDB(entries, 0);
        }

        const data = JSON.parse(json);

        for (const entry of data.entries) {
            if (entries[entry.id] != null) {
                throw new VaultageError(ERROR_CODE.DUPLICATE_ENTRY, 'Duplicate entry with id: ' + entry.id + ' in vault.');
            }
            entries[entry.id] = entry;
        }

        return new VaultDB(entries, data.revision);
    }

    private static VERSION: number = 0;

    public constructor(
            private _entries: { [key: string]: IVaultDBEntry },
            private _revision: number = 0) {
                this.refreshReUseCount();
                this.refreshStrengthIndication();
    }

    public add(attrs: IVaultDBEntryAttrs): string {
        let checkedAttrs = {
            title: '',
            url: '',
            login: '',
            password: ''
        };
        checkedAttrs = checkParams(attrs, checkedAttrs);
        const currentDate = (new Date()).toUTCString();
        const entry: IVaultDBEntry = {
            id: this.nextFreeId(),
            title: checkedAttrs.title,
            url: checkedAttrs.url,
            login: checkedAttrs.login,
            password: checkedAttrs.password,
            created: currentDate,
            updated: currentDate,
            usage_count: 0,
            reuse_count: 0,
            password_strength_indication: Passwords.getPasswordStrength(checkedAttrs.password),
            hidden: false,
        };
        this._entries[entry.id] = entry;

        this.refreshReUseCount();

        return entry.id;
    }

    public remove(id: string): void {
        if (this._entries[id] == null) {
            throw new VaultageError(ERROR_CODE.NO_SUCH_ENTRY, 'No entry with id "' + id + '"');
        }
        delete this._entries[id];

        this.refreshReUseCount();
    }

    public update(entry: IVaultDBEntry): void;
    public update(id: string, attrs: IVaultDBEntryAttrs): void;
    public update(id: (string | IVaultDBEntry), attrs?: IVaultDBEntryAttrs): void {

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
        if (attrs == null) {
             attrs = {};
        }

        const currentDate = (new Date()).toUTCString();
        const entry = this.get(id);

        if (attrs.login) {
            entry.login = attrs.login;
        }
        if (attrs.password) {
            entry.password = attrs.password;
            entry.password_strength_indication = Passwords.getPasswordStrength(attrs.password);
        }
        if (attrs.title) {
            entry.title = attrs.title;
        }
        if (attrs.url) {
            entry.url = attrs.url;
        }
        entry.updated = currentDate;

        this._entries[entry.id] = entry;

        this.refreshReUseCount();
    }

    public get(id: string): IVaultDBEntry {
        const entry = this._entries[id];
        if (entry == null) {
            throw new VaultageError(ERROR_CODE.NO_SUCH_ENTRY, 'No entry with id "' + id + '"');
        }
        return deepCopy(entry);
    }

    /**
     * Records the fact that one entry was used
     */
    public entryUsed(id: string): number {
        if (this._entries[id] == null) {
            throw new VaultageError(ERROR_CODE.NO_SUCH_ENTRY, 'No entry with id "' + id + '"');
        }

        return ++this._entries[id].usage_count;
    }

    public find(...queries: string[]): IVaultDBEntry[] {

        queries = queries.filter((e) => e.trim() !== '');
        const keys = Object.keys(this._entries);

        // if we search for nothing, return everyting
        if (queries.length === 0) {
            const resultSet: IVaultDBEntry[] = [];

            for (const key of keys) {
                resultSet.push(deepCopy(this._entries[key]));
            }
            return resultSet;
        }


        const accu: { [key: string]: {entry: IVaultDBEntry, hitcount: number} } = {};
        for (const key of keys) {
            accu[key] = { entry: this.get(key), hitcount: 0 };
        }

        for (const query of queries) {
            for (const key of keys) {
                const e = accu[key].entry;
                accu[key].hitcount += this.countOccurencesInEntry(e, query);
            }
        }

        // delete results with 0 hits
        for (const key of keys) {
            if (accu[key].hitcount === 0) {
                delete accu[key];
            }
        }

        // sort it
        const arrayOfTuples = Object.keys(accu).map((key) => {
            return {key: key, hitcount: accu[key].hitcount, entry: accu[key].entry};
        });

        arrayOfTuples.sort((e1, e2) => {
            return e2.hitcount - e1.hitcount;
        });

        const sortedEntries = arrayOfTuples.map((tuple) => deepCopy(tuple.entry));


        return sortedEntries;
    }


    /**
     * Returns a deep-copy of all DB entries
     */
    public getEntriesWhichReusePasswords(): IVaultDBEntry[] {
        this.refreshReUseCount();
        const entries: IVaultDBEntry[] = [];
        const keys = Object.keys(this._entries);
        for (const key of keys) {
            if (this._entries[key].reuse_count > 0) {
                entries.push(deepCopy(this._entries[key]));
            }
        }
        return entries;
    }


    /**
     * Returns a deep-copy of all DB entries
     */
    public getAll(): IVaultDBEntry[] {
        const entries: IVaultDBEntry[] = [];
        const keys = Object.keys(this._entries);
        for (const key of keys) {
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
     * Returns the next free ID
     */
    public nextFreeId(): string {
        let i = this.size();
        let nextFreeID: string = '' + i;

        while ( nextFreeID in this._entries ) {
            i++;
            nextFreeID = '' + i;
        }

        return nextFreeID;
    }

    /**
     * Bumps the revision number of this DB.
     */
    public newRevision(): void {
        this._revision++;
    }

    public getRevision(): number {
        return this._revision;
    }

    public countOccurencesInEntry(entry: IVaultDBEntry, needle: string): number {
        let hitCount = 0;
        const allowOverlapping = false;

        hitCount += this.countOccurrences(entry.id, needle, allowOverlapping);
        hitCount += this.countOccurrences(entry.title, needle, allowOverlapping);
        hitCount += this.countOccurrences(entry.login, needle, allowOverlapping);
        hitCount += this.countOccurrences(entry.url, needle, allowOverlapping);
        hitCount += this.countOccurrences(entry.password, needle, allowOverlapping);

        return hitCount;
    }

    /**
     * Replaces the current entries with the new set of provided entries. Keeps "lastFingerprint" to its old value,
     * so a "push" will work.
     * @param entries The entries to replace this db's entries
     */
    public replaceAllEntries(entries: IVaultDBEntry[]): void {
        const newEntries: {[key: string]: IVaultDBEntry} = {};

        const exampleEntry: IVaultDBEntry = {
            id: '0',
            title: '',
            url: '',
            login: '',
            password: '',
            created: '',
            updated: '',
            usage_count: 0,
            reuse_count: 0,
            password_strength_indication: PasswordStrength.WEAK,
            hidden: false,
        };

        for (const e of entries) {
            // basic sanity check
            for (const k of Object.keys(exampleEntry)) {
                if (!(k in e)) {
                    throw new Error('Tried to add entry, but it does not have the field "' + k + '"');
                }
            }

            // copy entry
            newEntries[e.id] = deepCopy(e);
        }

        this._entries = newEntries;
    }

    /**
     * Automatically updates the field "reuse_count" of all entries
     */
    private refreshReUseCount(): void {
        const passwordsCount: { [key: string]: number } = {};

        const keys = Object.keys(this._entries);
        for (const key of keys) {
            const e = this._entries[key];
            if (!(e.password in passwordsCount)) {
                passwordsCount[e.password] = 0;
            }
            passwordsCount[e.password]++;
        }

        // re-update all entries
        for (const key of keys) {
            const timesReused = passwordsCount[this._entries[key].password] - 1;
            this._entries[key].reuse_count = timesReused;
        }
    }

    /**
     * Automatically updates the field "password_strength_indication" of all entries
     */
    private refreshStrengthIndication(): void {

        // re-update all entries
        const keys = Object.keys(this._entries);
        for (const key of keys) {
            this._entries[key].password_strength_indication = Passwords.getPasswordStrength(this._entries[key].password);
        }
    }

    /** Function count the occurrences of substring in a string;
     * @param {String} string   Required. The string;
     * @param {String} subString    Required. The string to search for;
     * @param {Boolean} allowOverlapping    Optional. Default: false;
     * @author Vitim.us http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
     */
    private countOccurrences(haystack: string, needle: string, allowOverlapping: boolean): number {
        haystack = ('' + haystack).toLowerCase();
        needle = ('' + needle).toLowerCase();

        if (needle.length <= 0) {
            return (haystack.length + 1);
        }

        let n = 0;
        let pos = 0;
        const step = allowOverlapping ? 1 : needle.length;

        while (true) {
            pos = haystack.indexOf(needle, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else {
                break;
            }
        }
        return n;
    }
}
