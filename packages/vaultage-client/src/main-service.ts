import { injectable } from 'tsyringe';

import { CryptoService } from './crypto/crypto-service';
import { IHttpParams, ISaltsConfig } from './interface';
import { HttpApi } from './transport/http-api';
import { Vault } from './vault/Vault';
import { VaultService } from './vault/vault-service';

// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json');

@injectable()
export class MainService {

    constructor(
        private readonly httpApi: HttpApi,
        private readonly vaultService: VaultService,
        private readonly cryptoService: CryptoService) {
    }

    /**
     * Attempts to pull the cipher and decode it. Saves credentials on success.
     * @param serverURL URL to the vaultage server.
     * @param username The username used to locate the cipher on the server
     * @param masterPassword Plaintext of the master password
     * @return A promise which resolves with the authenticated vault upon successful login
     */
    public async login(
            serverURL: string,
            username: string,
            masterPassword: string,
            httpParams?: IHttpParams): Promise<Vault> {

        const cleanServerURL = serverURL.replace(/\/$/, ''); // Removes trailing slash


        const config = await this.httpApi.pullConfig(cleanServerURL, httpParams);

        const salts: ISaltsConfig = {
            LOCAL_KEY_SALT: config.salts.local_key_salt,
            REMOTE_KEY_SALT: config.salts.remote_key_salt,
        };

        const crypto = this.cryptoService.getCrypto(salts);

        const creds = {
            serverURL: cleanServerURL,
            username: username,
            localKey: await crypto.deriveLocalKey(masterPassword),
            remoteKey: await crypto.deriveRemoteKey(masterPassword)
        };

        const cipher = await this.httpApi.pullCipher(creds, httpParams);
        return this.vaultService.create(creds, crypto, cipher, httpParams, config.demo);
    }

    /**
     * Returns the current version of the vaultage-client package
     */
    public version(): string {
        return pkg.version;
    }
}
