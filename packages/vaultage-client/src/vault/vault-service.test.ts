import { anything, instance, Mock, mock, verify, when } from 'omnimock';

import { ICrypto } from '../crypto/ICrypto';
import { MergeService } from '../merge-service';
import { HttpApi } from '../transport/http-api';
import { ICredentials } from './Vault';
import { VaultService } from './vault-service';
import { VaultDB } from './VaultDB';
import { VaultDBService } from './vaultdb-service';

const creds: ICredentials = {
    localKey: 'the_local_key',
    remoteKey: 'the_remote_key',
    serverURL: 'http://url',
    username: 'john cena'
};

describe('VaultService', () => {

    let service: VaultService;
    let mockHttpApi: Mock<HttpApi>;
    let mockMergeService: Mock<MergeService>;
    let mockVaultDBService: Mock<VaultDBService>;
    let mockCrypto: Mock<ICrypto>;
    let mockDB: Mock<VaultDB>;

    beforeEach(() => {
        mockHttpApi = mock(HttpApi);
        mockMergeService = mock(MergeService);
        mockVaultDBService = mock(VaultDBService);
        mockCrypto = mock<ICrypto>('Crypto');
        mockDB = mock(VaultDB);

        when(mockVaultDBService.createEmpty()).return(instance(mockDB)).anyTimes();

        service = new VaultService(instance(mockHttpApi), instance(mockMergeService), instance(mockVaultDBService));
    });

    afterEach(() => {
        verify(mockHttpApi);
        verify(mockMergeService);
        verify(mockVaultDBService);
        verify(mockCrypto);
        verify(mockDB);
    })

    it('can create an empty vault', async () => {
        const vault = await service.create(creds, instance(mockCrypto), undefined);
        when(mockDB.find('')).return([]);
        expect(vault.getAllEntries().length).toBe(0);
    });

    it('encrypts and pushes a cipher', async () => {
        const vault = await service.create(creds, instance(mockCrypto), undefined);

        when(mockVaultDBService.serialize(anything())).return('opaque_ser');
        when(mockDB.newRevision()).return(undefined);
        when(mockCrypto.encrypt('the_local_key', 'opaque_ser')).resolve('opaque_cipher');
        when(mockCrypto.getFingerprint('opaque_ser', 'the_local_key')).resolve('opaque_fingerprint');

        when(mockHttpApi.pushCipher({
            serverURL: 'http://url',
            localKey: 'the_local_key',
            remoteKey: 'the_remote_key',
            username: 'john cena'
        }, null, 'opaque_cipher', undefined, 'opaque_fingerprint', undefined)).resolve(undefined);

        // save the current vault
        await vault.save();
    });

    it('adds a new entry', async () => {
        const vault = await service.create(creds, instance(mockCrypto), undefined);

        when(mockDB.add({
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        })).return('1');

        // add one entry
        vault.addEntry({
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        });
    });
});
