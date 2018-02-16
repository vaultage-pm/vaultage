import { IErrorPushPullResponse, IVaultageConfig, PushPullResponse } from 'vaultage-protocol';

import { HttpRequestParameters, HttpService } from './HTTPService';
import { ICredentials } from './Vault';
import { ERROR_CODE, VaultageError } from './VaultageError';

/**
 * Client-side of the HTTP interface between the Vaultage server and the client.
 *
 * This class strictly takes care of formatting the data to proper HTTP payloads and
 * sending them over the wire (or to the mock HTTP interface if it is mocked).
 * This class does not handle crypto stuff.
 */
export abstract class HttpApi {

    public static async pullConfig(serverURL: string): Promise<IVaultageConfig> {
        const res = await HttpService.request<IVaultageConfig>({
            url: serverURL + '/config'
        });
        try {
            return res.data;
        } catch (e) {
            throw new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e);
        }
    }

    public static async pullCipher(creds: ICredentials): Promise<string> {

        const parameters: HttpRequestParameters = {
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey)
        };

        const resp = await HttpService.request<PushPullResponse>(parameters);
        const body = resp.data;

        if (body.error != null && body.error === true) {
            return this.throwProtocolError(body);
        }
        return (body.data || '').replace(/[^a-z0-9+/:"{},]/ig, '');
    }

    public static async pushCipher(
            creds: ICredentials,
            newRemoteKey: (string|null),
            cipher: string,
            lastFingerprint: string | undefined,
            fingerprint: string): Promise<void> {

        const parameters: HttpRequestParameters = {
            method: 'POST',
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey),
            data: {
                new_password: newRemoteKey,
                new_data: cipher,
                old_hash: lastFingerprint,
                new_hash: fingerprint,
                force: false,
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const resp = await HttpService.request<PushPullResponse>(parameters);
        const body = resp.data;
        if (body.error === true) {
            return this.throwProtocolError(body);
        }
    }

    private static _makeURL(serverURL: string, username: string, remotePwdHash: string): string {
        return `${serverURL}/${encodeURIComponent(username)}/${remotePwdHash}/vaultage_api`;
    }

    private static throwProtocolError(err: IErrorPushPullResponse): never {
        switch (err.code) {
            case 'EFAST':
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD,
                        'The server has a newer version of the DB');
            case 'EAUTH':
                throw new VaultageError(ERROR_CODE.BAD_CREDENTIALS,
                        'The credentials used to log in are no longer valid. Please re-authenticate');
            default:
                throw this.ensureAllErrorsHandled(err.code);
        }
    }

    private static ensureAllErrorsHandled(_code: never) {
        // If this function causes a type error, then it means an error type was added or changed and
        // you forgot to update the error handling function accordingly.
        return new Error('The response received is not defined in the protocol.');
    }
}

