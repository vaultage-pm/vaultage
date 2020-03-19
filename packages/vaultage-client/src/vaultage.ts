import { getCrypto } from './crypto';
import { HttpApi } from './HTTPApi';
import { HttpRequestFunction, HttpService } from './HTTPService';
import { IHttpParams, ISaltsConfig } from './interface';
import { Vault } from './Vault';

export { Passwords } from './Passwords';
export { Vault } from './Vault';
export { VaultageError, ERROR_CODE } from './VaultageError';
export * from './interface';
export { supportsNativeCrypto } from './environment';

// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json');

/**
 * Attempts to pull the cipher and decode it. Saves credentials on success.
 * @param serverURL URL to the vaultage server.
 * @param username The username used to locate the cipher on the server
 * @param masterPassword Plaintext of the master password
 * @param cb Callback invoked on completion. err is null if no error occured.
 */
export async function login(
        serverURL: string,
        username: string,
        masterPassword: string,
        httpParams?: IHttpParams): Promise<Vault> {

    const creds = {
        serverURL: serverURL.replace(/\/$/, ''), // Removes trailing slash
        username: username,
        localKey: 'null',
        remoteKey: 'null'
    };

    const config = await HttpApi.pullConfig(creds.serverURL, httpParams);

    const salts: ISaltsConfig = {
        LOCAL_KEY_SALT: config.salts.local_key_salt,
        REMOTE_KEY_SALT: config.salts.remote_key_salt,
    };

    const crypto = getCrypto(salts);

    const remoteKey = await crypto.deriveRemoteKey(masterPassword);
    // possible optimization: compute the local key while the request is in the air
    const localKey = await crypto.deriveLocalKey(masterPassword);

    creds.localKey = localKey;
    creds.remoteKey = remoteKey;

    const cipher = await HttpApi.pullCipher(creds, httpParams);
    return new Vault(creds, crypto, cipher, httpParams, config.demo);
}

export function _mockHttpRequests(fn: HttpRequestFunction): void {
    HttpService.mock(fn);
}

/**
 * Returns the current version of the vaultage-client package
 */
export function version(): string {
    return pkg.version;
}
