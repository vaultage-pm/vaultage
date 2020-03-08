import { Crypto } from 'vaultage-client/src/Crypto';
import { ICredentials, Vault } from 'vaultage-client/src/Vault';
import { IVaultDBEntry, IVaultDBEntryAttrs } from 'vaultage-client/src/vaultage';
import { Merge } from 'vaultage-client/src/Merge';

describe('Merge.ts', () => {

    describe('merge works with corner cases', () => {

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
    ]
    const vault = getVaultWithEntries(dummyEntries);
    return vault;
}