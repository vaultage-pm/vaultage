import { ISaltsConfig } from './interface';
export { Passwords } from './Passwords';
export { Vault } from './Vault';
export { VaultageError, ERROR_CODE } from './VaultageError';
export * from './interface';

import { Crypto } from './Crypto';
import { HttpApi } from './HTTPApi';
import { HttpRequestFunction, HttpService } from './HTTPService';
import { Vault } from './Vault';

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
        masterPassword: string): Promise<Vault> {

    const creds = {
        serverURL: serverURL.replace(/\/$/, ''), // Removes trailing slash
        username: username,
        localKey: 'null',
        remoteKey: 'null'
    };

    const config = await HttpApi.pullConfig(creds.serverURL);

    const salts: ISaltsConfig = {
        LOCAL_KEY_SALT: config.salts.local_key_salt,
        REMOTE_KEY_SALT: config.salts.remote_key_salt,
    };

    const crypto = new Crypto(salts);

    const remoteKey = crypto.deriveRemoteKey(masterPassword);
    // possible optimization: compute the local key while the request is in the air
    const localKey = crypto.deriveLocalKey(masterPassword);

    creds.localKey = localKey;
    creds.remoteKey = remoteKey;

    const cipher = await HttpApi.pullCipher(creds);
    return new Vault(creds, crypto, cipher);
}

export function _mockHttpRequests(fn: HttpRequestFunction): void {
    HttpService.mock(fn);
}
