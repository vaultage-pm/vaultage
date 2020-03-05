import { IVaultDBEntry } from './interface';
import { VaultageError, ERROR_CODE } from './VaultageError';

export class Merge {

    public static mergeVaultsIfPossible(v1: IVaultDBEntry[], v2: IVaultDBEntry[]): IVaultDBEntry[] {

        if (v1 === undefined || v1.length === 0) {
            return v2;
        }
        if (v2 === undefined || v2.length === 0) {
            return v1;
        }

        const arrayToMap = (array: IVaultDBEntry[]) => {
            const map = new Map<string, IVaultDBEntry>();
            for(const entry of array) {
                map.set(entry.id, entry);
            }
            return map;
        }

        const v1Map = arrayToMap(v1);
        const v2Map = arrayToMap(v2);

        const newV1Entries: IVaultDBEntry[] = [];
        const newV2Entries: IVaultDBEntry[] = [];
        type VaultTuple = [IVaultDBEntry, IVaultDBEntry]; // v1 version, v2 version
        const modifiedBothWays: VaultTuple[] = [];

        for(const v1Entry of v1) {
            const v2Entry = v2Map.get(v1Entry.id)
            // find new v1 entries
            if (v2Entry === undefined) {
                newV1Entries.push(v1Entry);
            }
            // find modified entries
            else if (!Merge.entriesArePerfectlyEqual(v1Entry, v2Entry)){
                modifiedBothWays.push([v1Entry, v2Entry]);
            }
        }
        for(const v2Entry of v2) {
            // find new v2 entries
            if(!v1Map.has(v2Entry.id)) {
                newV2Entries.push(v2Entry);
            }
        }

        // At this stage, we have the following possible scenarios (mutually exclusive):
        // 1. no changes, DB are the same => return v1
        // 2. deleted entries => those will be remerged, sadly, because a deletion on v1 looks like an add on v2
        // 3. added entries: at most 1 new in each v1 and v2
        // 4. modified entries: at most 2 changes

        const numberNew = newV1Entries.length + newV2Entries.length;
        const numberEdited = modifiedBothWays.length;

        if (numberNew + numberEdited === 0) {
            return v1;
        }

        if (numberNew === 2) {
            if (newV1Entries.length > 1 || newV2Entries.length > 1 || numberEdited !== 0) {
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, too many changes. Detected ${numberNew} additions (${newV1Entries.length} on v1 and ${newV2Entries.length} on v2) and ${numberEdited} edits.`);
            }

            // add v2 new to v1
            const result = Merge.deepClone(v1);
            result.push(newV2Entries[0]);
            return result;
        }

        if (numberEdited === 2) {
            if (newV1Entries.length > 0 || newV2Entries.length > 0) {
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, too many changes. Detected ${numberNew} additions (${newV1Entries.length} on v1 and ${newV2Entries.length} on v2) and ${numberEdited} edits.`);
            }

            // merge the two
            const mergedEntries: IVaultDBEntry[] = [];
            for(const entries of modifiedBothWays) {
                const v1Entry = entries[0];
                const v2Entry = entries[1];

                if(Merge.entriesAreSemanticallyEqual(v1Entry, v2Entry)) {
                    mergedEntries.push(this.mergeEntries(v1Entry, v2Entry))
                } else {
                    throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, entries modified but not semantically equal anymore: ${JSON.stringify(v1Entry)}, ${JSON.stringify(v2Entry)}`);
                }
            }

            if (mergedEntries.length !== 2) {
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, too many changes. Pre-merge, we had ${numberEdited} differences; Post-merge, we have ${mergedEntries.length} edits.`);
            }

            const result: IVaultDBEntry[] = [];
            for(const v1Entry of v1) {
                // copy non-edited entries
                if (v1Entry.id !== mergedEntries[0].id && v1Entry.id !== mergedEntries[1].id) {
                    result.push(Merge.deepCloneEntry(v1Entry))
                }
            }
            // now add merged entries
            for(const mergedEntry of mergedEntries) {
                result.push(Merge.deepCloneEntry(mergedEntry))
            }

            if (result.length !== v1.length) {
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically. Pre-merge, we had ${v1.length} entries; Post-merge, we have ${result.length} entries.`);
            }

            throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, end of algorithm. Detected ${numberNew} additions (${newV1Entries.length} on v1 and ${newV2Entries.length} on v2) and ${numberEdited} edits.`);
        }

        // if we reach here, we have one addition, and one edit. There is no merge to do ! the edited entry is more recent.
        // Locate on which side is the addition, apply it to the other side
        if(newV1Entries.length === 0 && newV2Entries.length === 1) {
            // add v2 new to v1
            const result = Merge.deepClone(v1);
            result.push(newV2Entries[0]);
            return result;
        }
        else if (newV1Entries.length === 1 && newV2Entries.length === 0) {
            // add v2 new to v1
            const result = Merge.deepClone(v1);
            result.push(newV1Entries[0]);
            return result;
        }

        return []
    }

    public static deepCloneEntry (entry: IVaultDBEntry): IVaultDBEntry {
        return JSON.parse(JSON.stringify(entry));
    }

    public static deepClone (entries: IVaultDBEntry[]): IVaultDBEntry[] {
        return JSON.parse(JSON.stringify(entries));
    }

    public static mergeEntries (e1: IVaultDBEntry, e2: IVaultDBEntry): IVaultDBEntry {
        if(!Merge.entriesAreSemanticallyEqual(e1, e2)) {
            throw new Error('Something went terribly wrong; can\'t merge: ' + JSON.stringify([e1, e2]));
        }
        const result: IVaultDBEntry = JSON.parse(JSON.stringify(e1))
        result.usage_count = Math.max(e1.usage_count, e2.usage_count)
        result.reuse_count = Math.max(e1.reuse_count, e2.reuse_count)
        return result
    }

    public static entriesArePerfectlyEqual (e1: IVaultDBEntry, e2: IVaultDBEntry) {
        return Merge.entriesAreSemanticallyEqual(e1, e2) &&
        (e1.created === e2.created) &&
        (e1.updated === e2.updated) &&
        (e1.usage_count === e2.usage_count) &&
        (e1.reuse_count === e2.reuse_count) &&
        (e1.hidden === e2.hidden)
    }

    public static entriesAreSemanticallyEqual (e1: IVaultDBEntry, e2: IVaultDBEntry) {
        return (e1.id === e2.id) &&
        (e1.title === e2.title) &&
        (e1.url === e2.url) &&
        (e1.login === e2.login) &&
        (e1.password === e2.password)
        // do not compare usage count, etc
    }
};

