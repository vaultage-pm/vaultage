import { MergeService } from 'src/merge-service';
import { IVaultDBEntry } from 'src/public-api';

describe('MergeService', () => {

    let service: MergeService;

    beforeEach(() => {
        service = new MergeService();
    });

    describe('merge works with corner cases', () => {

        it('empty parameters', async () => {
            const entries1 = getBaseLineVaultEntries();
            const empty: IVaultDBEntry[] = [];

            const merged = service.mergeVaultsIfPossible(entries1, empty)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();

            const merged2 = service.mergeVaultsIfPossible(empty, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
        });

        it('same parameters', async () => {
            const entries1 = getBaseLineVaultEntries();

            const merged = service.mergeVaultsIfPossible(entries1, entries1)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
        });

        it('same parameters 2', async () => {
            const entries1 = getBaseLineVaultEntries();
            const entries2 = getBaseLineVaultEntries();

            const merged = service.mergeVaultsIfPossible(entries1, entries2)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
        });

        it('one new entry', async () => {
            const entries1 = [...getBaseLineVaultEntries(), newRandomEntry()];
            const entries2 = getBaseLineVaultEntries();

            expect(entries1.length).toEqual(entries2.length + 1)

            const merged = service.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();

            // test the symmetrical
            const merged2 = service.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.result.length).toEqual(entries1.length)
            expect(merged2.result.length).toEqual(entries2.length + 1)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2.result)).toBeFalsy();
        });

        it('one edit (usage_count)', async () => {
            const entries1 = getBaseLineVaultEntries();
            // v1.entryUsed('0')
            const entries2 = getBaseLineVaultEntries();

            expect(entries1.length).toEqual(entries2.length)

            const merged = service.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();

            // test the symmetrical
            const merged2 = service.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.result.length).toEqual(entries1.length)
            expect(merged2.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeTruthy();
            expect(vaultEntriesDeepEqual(entries2, merged2.result)).toBeFalsy();
        });

        it('two edits (usage_count)', async () => {
            const entries1 = getBaseLineVaultEntries();
            // v1.entryUsed('0')
            const entries2 = getBaseLineVaultEntries();
            // v2.entryUsed('1')

            const expectedEntries = getBaseLineVaultEntries();
            // expectedResult.entryUsed('0');
            // expectedResult.entryUsed('1');

            expect(entries1.length).toEqual(entries2.length)

            const merged = service.mergeVaultsIfPossible(entries1, entries2)
            expect(merged.result.length).toEqual(entries1.length)
            expect(merged.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(entries2, merged.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(merged.result, expectedEntries)).toBeTruthy();

            // test the symmetrical
            const merged2 = service.mergeVaultsIfPossible(entries2, entries1)
            expect(merged2.result.length).toEqual(entries1.length)
            expect(merged2.result.length).toEqual(entries2.length)
            expect(vaultEntriesDeepEqual(entries1, merged2.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(entries2, merged2.result)).toBeFalsy();
            expect(vaultEntriesDeepEqual(merged2.result, expectedEntries)).toBeTruthy();
        });

        it('one edit, one new entry', async () => {
            // const newRndEntry = newRandomEntry();
            const entries1 = getBaseLineVaultEntries();
            // v1.addEntry(newRndEntry)
            const entries2 = getBaseLineVaultEntries();
            // v2.entryUsed('0');

            expect(entries1.length).toEqual(entries2.length + 1)

            const expectedEntries = getBaseLineVaultEntries();
            // expectedResult.entryUsed('0');
            // expectedResult.addEntry(newRndEntry)

            // swap order
            const expectedEntries2 = getBaseLineVaultEntries();
            // expectedResult2.addEntry(newRndEntry)
            // expectedResult2.entryUsed('0');

            const merged = service.mergeVaultsIfPossible(entries1, entries2)
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
            // const e = newRandomEntry()
            const entries1 = getBaseLineVaultEntries();
            // v1.addEntry(e)
            const entries2 = getBaseLineVaultEntries();
            // e.login += 'padding';
            // v2.addEntry(e)

            expect(entries1.length).toEqual(entries2.length)

            try {
                service.mergeVaultsIfPossible(entries1, entries2)
                fail('Should not allow impossible merge of two different entries with same ID');
            } catch (e) {
                // should get there
            }

            // test the symmetrical
            try {
                service.mergeVaultsIfPossible(entries2, entries1)
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

function newRandomEntry(): IVaultDBEntry {
    return {
        id: generateString(10),
        created: generateString(2),
        updated: generateString(4),
        hidden: false,
        password_strength_indication: 2,
        reuse_count: 1,
        usage_count: 10,
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

// async function getVaultWithEntries(entries: IVaultDBEntryAttrs[]): Promise<Vault> {
//     const creds: ICredentials = {
//         localKey: 'the_local_key',
//         remoteKey: 'the_remote_key',
//         serverURL: 'http://url',
//         username: 'john cena'
//     };

//     const crypto = getCrypto({
//         LOCAL_KEY_SALT: 'deadbeef',
//         REMOTE_KEY_SALT: '0123456789',
//     });

//     const vault = await Vault.create(creds, crypto, undefined);

//     for(const entry of entries){
//         vault.addEntry(entry)
//     }

//     return vault
// }

function getBaseLineVaultEntries(): IVaultDBEntry[] {
    return [
        {
            id: '1',
            created: '1234',
            updated: '2345',
            usage_count: 1,
            hidden: false,
            password_strength_indication: 1,
            reuse_count: 0,
            title: 'Hello1',
            login: 'Bob1',
            password: 'zephyr1',
            url: 'http://example.com1'
        },
        {
            id: '2',
            created: '5678',
            updated: '6789',
            hidden: true,
            password_strength_indication: 2,
            reuse_count: 1,
            usage_count: 30,
            title: 'Hello2',
            login: 'Bob2',
            password: 'zephyr2',
            url: 'http://example.com2'
        },
    ];
}