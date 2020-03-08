import { Crypto } from 'vaultage-client/src/Crypto';
import { ICredentials, Vault } from 'vaultage-client/src/Vault';
import { IVaultDBEntry, IVaultDBEntryAttrs } from 'vaultage-client/src/vaultage';
import { Merge } from 'vaultage-client/src/Merge';

describe('Merge.ts', () => {

    describe('merge works with corner cases', () => {

        it('null parameters', () => {
            const v1 = getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();
            const empty = undefined as unknown as IVaultDBEntry[];

            const merged = Merge.mergeVaultsIfPossible(entries1, empty)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();

            const merged2 = Merge.mergeVaultsIfPossible(empty, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged2)).toBeTruthy();
        });

        it('empty parameters', () => {
            const v1 = getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();
            const empty = [] as IVaultDBEntry[];

            const merged = Merge.mergeVaultsIfPossible(entries1, empty)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();

            const merged2 = Merge.mergeVaultsIfPossible(empty, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged2)).toBeTruthy();
        });

        it('same parameters', () => {
            const v1 = getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();

            const merged = Merge.mergeVaultsIfPossible(entries1, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();
        });

        it('same parameters 2', () => {
            const v1 = getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();
            const v2 = getBaseLineVaultEntries();
            const entries2 = v2.getAllEntries();

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();
        });

        it('one new entry', () => {
            const v1 = getBaseLineVaultEntries();
            v1.addEntry(newRandomEntry())
            const entries1 = v1.getAllEntries();
            const v2 = getBaseLineVaultEntries();
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length + 1)

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.length).toEqual(entries1.length)
            expect(merged.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged)).toBeFalsy();

            // test the symmetrical
            const merged2 = Merge.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.length).toEqual(entries1.length)
            expect(merged2.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged2)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2)).toBeFalsy();
        });

        it('one edit (usage_count)', () => {
            const v1 = getBaseLineVaultEntries();
            v1.entryUsed('0')
            const entries1 = v1.getAllEntries();
            const v2 = getBaseLineVaultEntries();
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length)

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.length).toEqual(entries1.length)
            expect(merged.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged)).toBeFalsy();

            // test the symmetrical
            const merged2 = Merge.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.length).toEqual(entries1.length)
            expect(merged2.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged2)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2)).toBeFalsy();
        });

        it('twp edit (usage_count)', () => {
            const v1 = getBaseLineVaultEntries();
            v1.entryUsed('0')
            const entries1 = v1.getAllEntries();
            const v2 = getBaseLineVaultEntries();
            v2.entryUsed('1')
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length)

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.length).toEqual(entries1.length)
            expect(merged.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged)).toBeFalsy();

            // test the symmetrical
            const merged2 = Merge.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.length).toEqual(entries1.length)
            expect(merged2.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged2)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2)).toBeFalsy();
        });

        it('two new entries with the same ID', () => {
            const v1 = getBaseLineVaultEntries();
            v1.addEntry(newRandomEntry())
            const entries1 = v1.getAllEntries();
            const v2 = getBaseLineVaultEntries();
            v2.addEntry(newRandomEntry())
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length)

            try {
                Merge.mergeVaultsIfPossible(entries1, entries2)
                fail('Should not allow impossible merge of two different entries with same ID');
            } catch (e) {
                // should get there
            }

            // test the symmetrical
            try {
                Merge.mergeVaultsIfPossible(entries2, entries1)
                fail('Should not allow impossible merge of two different entries with same ID');
            } catch (e) {
                // should get there
            }
        });

        it('two new entries with the same ID', () => {
            const v1 = getBaseLineVaultEntries();
            const e = newRandomEntry()
            v1.addEntry(e)
            const entries1 = v1.getAllEntries();
            const v2 = getBaseLineVaultEntries();
            e.login += 'padding';
            v2.addEntry(e)
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length)

            try {
                Merge.mergeVaultsIfPossible(entries1, entries2)
                fail('Should not allow impossible merge of two different entries with same ID');
            } catch (e) {
                // should get there
            }

            // test the symmetrical
            try {
                Merge.mergeVaultsIfPossible(entries2, entries1)
                fail('Should not allow impossible merge of two different entries with same ID');
            } catch (e) {
                // should get there
            }
        });
    });
});

function vaultEntriesDeepEqual(e1: IVaultDBEntry[], e2: IVaultDBEntry[]): boolean {
    return JSON.stringify(e1) === JSON.stringify(e2);
}

function getVaultWithEntries(entries: IVaultDBEntryAttrs[]): Vault {
    const creds: ICredentials = {
        localKey: 'the_local_key',
        remoteKey: 'the_remote_key',
        serverURL: 'http://url',
        username: 'john cena'
    };

    const crypto = new Crypto({
        LOCAL_KEY_SALT: 'deadbeef',
        REMOTE_KEY_SALT: '0123456789',
    });

    const vault = new Vault(creds, crypto, undefined);

    for(const entry of entries){
        vault.addEntry(entry)
    }

    return vault
}

function generateString(len: number) {
    return Math.random().toString(36).substr(2, 2 + len);
}

function newRandomEntry(): IVaultDBEntryAttrs {
    return {
        title: generateString(20),
        login: generateString(20),
        password: generateString(20),
        url: generateString(20)
    };
}

function getBaseLineVaultEntries(): Vault {
    const dummyEntries: IVaultDBEntryAttrs[] = [
        {
            title: 'Hello1',
            login: 'Bob1',
            password: 'zephyr1',
            url: 'http://example.com1'
        },
        {
            title: 'Hello2',
            login: 'Bob2',
            password: 'zephyr2',
            url: 'http://example.com2'
        },
        {
            title: 'Hello3',
            login: '',
            password: 'zephyr3',
            url: 'http://example.com3'
        },
        {
            title: '',
            login: 'Bob4',
            password: 'zephyr4',
            url: 'http://example.com4'
        },
        {
            title: '',
            login: '',
            password: '',
            url: 'http://example.com5'
        },
        {
            title: '',
            login: '',
            password: '',
            url: ''
        },
    ]
    const vault = getVaultWithEntries(dummyEntries);
    return vault;
}