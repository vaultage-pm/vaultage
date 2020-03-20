import { instance, Mock, mock, mockInstance, verify, when } from 'omnimock';
import { MainService } from 'src/main-service';
import { HttpApi } from 'src/transport/http-api';

import { CryptoService } from './crypto/crypto-service';
import { VaultService } from './vault/vault-service';
import { ICredentials, Vault } from './vault/Vault';
import { ISaltsConfig, IHttpParams } from './interface';
import { ICrypto } from './crypto/ICrypto';


function fakeSalts(): ISaltsConfig {
    return { LOCAL_KEY_SALT: 'deadbeef', REMOTE_KEY_SALT: '0123456789'};
}


describe('MainService', () => {
    let service: MainService;

    let httpApi: Mock<HttpApi>;
    let vaultService: Mock<VaultService>;
    let cryptoService: Mock<CryptoService>;
    let crypto: Mock<ICrypto>;

    beforeEach(() => {
        crypto = mock('Crypto');
        httpApi = mock(HttpApi);
        vaultService = mock(VaultService);
        cryptoService = mock(CryptoService);
        when(cryptoService.getCrypto(fakeSalts())).return(instance(crypto));
        service = new MainService(instance(httpApi), instance(vaultService), instance(cryptoService));
    });

    afterEach(() => {
        verify(httpApi);
        verify(vaultService);
        verify(cryptoService);
    });

    describe('login', () => {
        it('login pulls the config and cipher and creates a vault', async () => {
            const httpParams = mockInstance<IHttpParams>('httpParams');
            const isDemo = false;
            const fakeConfig = {
                salts: { local_key_salt: 'deadbeef', remote_key_salt: '0123456789'},
                version: 1,
                demo: isDemo,
            };

            when(httpApi.pullConfig('https://url', httpParams)).resolve(fakeConfig);

            when(crypto.deriveRemoteKey('passwd')).resolve('r3m0t3');
            when(crypto.deriveLocalKey('passwd')).resolve('l0c4l');

            const creds: ICredentials = {
                localKey: 'l0c4l',
                remoteKey: 'r3m0t3',
                serverURL: 'https://url',
                username: 'username'
            }

            when(httpApi.pullCipher(creds, httpParams)).resolve('c1ph3r');

            const vault = mockInstance<Vault>('vault');
            when(vaultService.create(creds, instance(crypto), 'c1ph3r', httpParams, isDemo)).return(Promise.resolve(vault));
            const result = await service.login('https://url', 'username', 'passwd', httpParams);
            expect(result).toBe(vault);
        });

        it('login rejects on error', async () => {
            when(httpApi.pullConfig('url', undefined)).reject('404 error');
            await expect(service.login('url', 'username', 'passwd')).rejects.toEqual('404 error');
        });
    });

    describe('version', () => {
        it('returns the current version', () => {
            expect(service.version()).toBe('0.0.0');
        });
    });
});
