export * from './Crypto';
export * from './Passwords';
export * from './Vault';
export * from './VaultageError';
export * from './VaultDB';
// TODO: Write public interfaces in a separate file and export from there


import { Crypto } from './Crypto';
import { ISaltsConfig } from './Crypto';
import { HttpApi } from './HTTPApi';
import { ApiCallFunction, HttpService } from './HTTPService';
import { Vault } from './Vault';

/**
 * Attempts to pull the cipher and decode it. Saves credentials on success.
 * @param serverURL URL to the vaultage server.
 * @param username The username used to locate the cipher on the server
 * @param masterPassword Plaintext of the master password
 * @param cb Callback invoked on completion. err is null if no error occured.
 */
export function login(
        serverURL: string,
        username: string,
        masterPassword: string): Promise<Vault> {

    const creds = {
        serverURL: serverURL.replace(/\/$/, ''), // Removes trailing slash
        username: username,
        localKey: 'null',
        remoteKey: 'null'
    };

    return new Promise((resolve, reject) => {
        HttpApi.pullConfig(creds.serverURL, (err, config?) => {

            if (err || !config) {
                return reject(err);
            }

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

            HttpApi.pullCipher(creds, (err2, cipher) => {
                if (err2) {
                    return reject(err2);
                }
                const vault = new Vault(creds, crypto, cipher);
                resolve(vault);
            });

        });
    });
}

export function _mockHttpRequests(fn: ApiCallFunction): void {
    HttpService.mock(fn);
}
