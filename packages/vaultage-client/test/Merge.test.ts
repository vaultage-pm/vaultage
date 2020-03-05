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