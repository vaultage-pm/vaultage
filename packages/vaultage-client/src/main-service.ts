import { CryptoService } from 'src/crypto/crypto-service';
import { HttpApi } from 'src/transport/http-api';
import { IHttpParams, ISaltsConfig } from 'src/interface';
import { Vault } from 'src/vault/Vault';
import { injectable } from 'inversify';
import { VaultService } from 'src/vault/vault-service';

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
