import { getCrypto } from 'vaultage-client/src/crypto';
import { ICredentials, Vault } from 'vaultage-client/src/Vault';
import { IVaultDBEntry, IVaultDBEntryAttrs } from 'vaultage-client/src/vaultage';
import { Merge } from 'vaultage-client/src/Merge';

describe('Merge.ts', () => {

    describe('merge works with corner cases', () => {

        it('null parameters', async () => {
            const v1 = await getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();
            const empty = undefined as unknown as IVaultDBEntry[];

            const merged = Merge.mergeVaultsIfPossible(entries1, empty)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();

            const merged2 = Merge.mergeVaultsIfPossible(empty, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
        });

        it('empty parameters', async () => {
            const v1 = await getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();
            const empty = [] as IVaultDBEntry[];

            const merged = Merge.mergeVaultsIfPossible(entries1, empty)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();

            const merged2 = Merge.mergeVaultsIfPossible(empty, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
        });

        it('same parameters', async () => {
            const v1 = await getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();

            const merged = Merge.mergeVaultsIfPossible(entries1, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
        });

        it('same parameters 2', async () => {
            const v1 = await getBaseLineVaultEntries();
            const entries1 = v1.getAllEntries();
            const v2 = await getBaseLineVaultEntries();
            const entries2 = v2.getAllEntries();

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
        });

        it('one new entry', async () => {
            const v1 = await getBaseLineVaultEntries();
            v1.addEntry(newRandomEntry())
            const entries1 = v1.getAllEntries();
            const v2 = await getBaseLineVaultEntries();
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length + 1)

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();

            // test the symmetrical
            const merged2 = Merge.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.result.length).toEqual(entries1.length)
            expect(merged2.result.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2.result)).toBeFalsy();
        });

        it('one edit (usage_count)', async () => {
            const v1 = await getBaseLineVaultEntries();
            v1.entryUsed('0')
            const entries1 = v1.getAllEntries();
            const v2 = await getBaseLineVaultEntries();
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length)

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();

            // test the symmetrical
            const merged2 = Merge.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.result.length).toEqual(entries1.length)
            expect(merged2.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2.result)).toBeFalsy();
        });

        it('two edits (usage_count)', async () => {
            const v1 = await getBaseLineVaultEntries();
            v1.entryUsed('0')
            const entries1 = v1.getAllEntries();
            const v2 = await getBaseLineVaultEntries();
            v2.entryUsed('1')
            const entries2 = v2.getAllEntries();

            const expectedResult = await getBaseLineVaultEntries();
            expectedResult.entryUsed('0');
            expectedResult.entryUsed('1');
            const expectedEntries = expectedResult.getAllEntries();

            expect(entries1.length).toEqual(entries2.length)

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(merged.result, expectedEntries)).toBeTruthy();

            // test the symmetrical
            const merged2 = Merge.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.result.length).toEqual(entries1.length)
            expect(merged2.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(entries2, merged2.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(merged2.result, expectedEntries)).toBeTruthy();
        });

        it('one edit, one new entry', async () => {
            const v1 = await getBaseLineVaultEntries();
            const newRndEntry = newRandomEntry();
            v1.addEntry(newRndEntry)
            const entries1 = v1.getAllEntries();
            const v2 = await getBaseLineVaultEntries();
            v2.entryUsed('0');
            const entries2 = v2.getAllEntries();

            expect(entries1.length).toEqual(entries2.length + 1)

            const expectedResult = await getBaseLineVaultEntries();
            expectedResult.entryUsed('0');
            expectedResult.addEntry(newRndEntry)
            const expectedEntries = expectedResult.getAllEntries();

            // swap order
            const expectedResult2 = await getBaseLineVaultEntries();
            expectedResult2.addEntry(newRndEntry)
            expectedResult2.entryUsed('0');
            const expectedEntries2 = expectedResult2.getAllEntries();

            const merged = Merge.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(merged.result, expectedEntries)).toBeTruthy();
            expect(vaultEntriesDeepEqual(merged.result, expectedEntries2)).toBeTruthy();

            // test output
            const strOutput = merged.toString();
            console.log(strOutput);
        });

        it('two new entries with the same ID', async () => {
            const v1 = await getBaseLineVaultEntries();
            const e = newRandomEntry()
            v1.addEntry(e)
            const entries1 = v1.getAllEntries();
            const v2 = await getBaseLineVaultEntries();
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

function vaultEntriesDeepEqual(e1: IVaultDBEntry[], e2: IVaultDBEntry[]): boolean {
    const e1Sorted = e1.sort((a, b) => a.id.localeCompare(b.id))
    const e2Sorted = e2.sort((a, b) => a.id.localeCompare(b.id))
    return JSON.stringify(e1Sorted) === JSON.stringify(e2Sorted);
}

async function getVaultWithEntries(entries: IVaultDBEntryAttrs[]): Promise<Vault> {
    const creds: ICredentials = {
        localKey: 'the_local_key',
        remoteKey: 'the_remote_key',
        serverURL: 'http://url',
        username: 'john cena'
    };

    const crypto = getCrypto({
        LOCAL_KEY_SALT: 'deadbeef',
        REMOTE_KEY_SALT: '0123456789',
    });

    const vault = await Vault.create(creds, crypto, undefined);

    for(const entry of entries){
        vault.addEntry(entry)
    }

    return vault
}

function getBaseLineVaultEntries(): Promise<Vault> {
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
    ]
    return getVaultWithEntries(dummyEntries);
}