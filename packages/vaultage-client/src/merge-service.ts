import { injectable } from 'tsyringe';

import { IVaultDBEntry } from './interface';
import { deepCopy } from './utils';
import { ERROR_CODE, VaultageError } from './VaultageError';


export enum MERGE_STATUS {

    DIDNT_MERGE = 2,
    NOTHING_TO_MERGE,
    SUCCESSFUL
}

/**
 * Class for errors coming from the Vaultage lib.
 * @constructor
 *
 * @member {number} code Code as defined in Vaultage.ERROR_CODES. Rely on this when processing the error.
 * @member {string} message Human readable error message. Do not rely on this when processing the error.
 * @member {?Error} cause Exception causing this error
 */
export class MergeStatus {
    constructor(
        public code: MERGE_STATUS,
        public result: IVaultDBEntry[] = [],
        public message: string = '',) {
    }

    public newLine(s: string) {
        this.message += s + '\n';
    }

    public newAddition(s: string, side: string='') {
        this.message += `[${side}+] ` + s + '\n';
    }

    public newDelete(s: string, side: string='') {
        this.message += `[${side}-] ` + s + '\n';
    }

    public newEdit(s: string) {
        this.message += '[ *] ' + s + '\n';
    }

    public toString(): string {
        let str = '';
        switch(this.code) {
            case MERGE_STATUS.NOTHING_TO_MERGE:
                str += 'Nothing To Merge';
                break;
            case MERGE_STATUS.DIDNT_MERGE:
                str += 'Did Not Merge';
                break;
            case MERGE_STATUS.SUCCESSFUL:
                str += 'Successful';
                break;
        }
        return str + ': ' +this.message;
    }
}

@injectable()
export class MergeService {

    public mergeVaultsIfPossible(v1: IVaultDBEntry[], v2: IVaultDBEntry[]): MergeStatus {

        // corner cases
        if (v1.length === 0) {
            return new MergeStatus(MERGE_STATUS.NOTHING_TO_MERGE, deepCopy(v2))
        }
        if (v2.length === 0) {
            return new MergeStatus(MERGE_STATUS.NOTHING_TO_MERGE, deepCopy(v1))
        }

        // prepare maps for mapping one onto the other
        const arrayToMap = (array: IVaultDBEntry[]) => {
            const map = new Map<string, IVaultDBEntry>();
            for(const entry of array) {
                map.set(entry.id, entry);
            }
            return map;
        }
        const v1Map = arrayToMap(v1);
        const v2Map = arrayToMap(v2);

        // find the differences
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
            else if (!this.entriesArePerfectlyEqual(v1Entry, v2Entry)){
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
        // 3. added entries: at most 1 new in each v1 and v2 -> they will have the same ID, unmergeable. if Abort
        // 4. modified entries: at most 2 changes

        const numberNew = newV1Entries.length + newV2Entries.length;
        const numberEdited = modifiedBothWays.length;

        if (numberNew + numberEdited === 0) {
            return new MergeStatus(MERGE_STATUS.NOTHING_TO_MERGE, deepCopy(v1))
        }

        const status = new MergeStatus(MERGE_STATUS.DIDNT_MERGE);

        status.newLine(`Detected ${numberNew} additions (${newV1Entries.length} on local and ${newV2Entries.length} on remote) and ${numberEdited} edits.`);


        if (numberNew > 1 || numberEdited > 2) {
            throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, too many changes. Detected ${numberNew} additions (${newV1Entries.length} on v1 and ${newV2Entries.length} on v2) and ${numberEdited} edits.`);
        }

        // merge the two
        const mergedEntries: IVaultDBEntry[] = [];
        for(const entries of modifiedBothWays) {
            const v1Entry = entries[0];
            const v2Entry = entries[1];

            if(this.entriesAreSemanticallyEqual(v1Entry, v2Entry)) {
                const mergedEntry = this.mergeEntries(v1Entry, v2Entry);
                status.newDelete(this.entryToShortString(v1Entry), 'l');
                status.newDelete(this.entryToShortString(v2Entry), 'r');
                status.newEdit(this.entryToShortString(mergedEntry));
                mergedEntries.push(mergedEntry);
            } else {
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, entries modified but not semantically equal anymore: ${JSON.stringify(v1Entry)}, ${JSON.stringify(v2Entry)}`);
            }
        }
        if (mergedEntries.length !== numberEdited) {
            throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, `Couldn't merge automatically, too many changes. Pre-merge, we had ${numberEdited} differences; Post-merge, we have ${mergedEntries.length} edits.`);
        }

        const alreadyMergedIDs = new Set(mergedEntries.map((e) => e.id));
        const v1EntriesAdded = new Set();
        const result: IVaultDBEntry[] = [];

        // copy v1->result
        for(const v1Entry of v1) {
            // copy non-edited entries
            if (!alreadyMergedIDs.has(v1Entry.id)) {

                const clone = deepCopy(v1Entry);
                if (!v2Map.has(v1Entry.id)) {
                    status.newAddition(this.entryToShortString(clone), 'l');
                }
                result.push(clone);
                v1EntriesAdded.add(v1Entry.id);
            }
        }
        // copy v2->result
        for(const v2Entry of v2) {
            // copy non-edited entries
            if (!v1EntriesAdded.has(v2Entry.id) && !alreadyMergedIDs.has(v2Entry.id)) {
                const clone = deepCopy(v2Entry);
                status.newAddition(this.entryToShortString(clone), 'r');
                result.push(deepCopy(v2Entry))
            }
        }
        // now add merged entries
        for(const mergedEntry of mergedEntries) {
            result.push(deepCopy(mergedEntry))
        }

        status.code = MERGE_STATUS.SUCCESSFUL;
        status.result = result;
        return status;
    }


    public entryToShortString(e: IVaultDBEntry): string {
        const e2 = deepCopy(e);
        delete e2.updated;
        delete e2.created;
        delete e2.password_strength_indication;
        return JSON.stringify(e2).replace(/"/g, '');
    }

    public mergeEntries (e1: IVaultDBEntry, e2: IVaultDBEntry): IVaultDBEntry {
        if(!this.entriesAreSemanticallyEqual(e1, e2)) {
            throw new Error('Something went terribly wrong; can\'t merge: ' + JSON.stringify([e1, e2]));
        }
        const result: IVaultDBEntry = JSON.parse(JSON.stringify(e1))
        result.usage_count = Math.max(e1.usage_count, e2.usage_count)
        result.reuse_count = Math.max(e1.reuse_count, e2.reuse_count)
        return result
    }

    public entriesArePerfectlyEqual (e1: IVaultDBEntry, e2: IVaultDBEntry) {
        return this.entriesAreSemanticallyEqual(e1, e2) &&
        (e1.created === e2.created) &&
        (e1.updated === e2.updated) &&
        (e1.usage_count === e2.usage_count) &&
        (e1.reuse_count === e2.reuse_count) &&
        (e1.hidden === e2.hidden)
    }

    public entriesAreSemanticallyEqual (e1: IVaultDBEntry, e2: IVaultDBEntry) {
        return (e1.id === e2.id) &&
        (e1.title === e2.title) &&
        (e1.url === e2.url) &&
        (e1.login === e2.login) &&
        (e1.password === e2.password)
        // do not compare usage count, etc
    }
};

