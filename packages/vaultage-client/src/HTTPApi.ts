import { IVaultageConfig } from '../../vaultage/src/apiServer';
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
        const res = await HttpService.request({
            url: serverURL + '/config'
        });
        try {
            return JSON.parse(res.body);
        } catch (e) {
            throw new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e);
        }
    }

    public static async pullCipher(creds: ICredentials): Promise<string> {

        const parameters: HttpRequestParameters = {
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey)
        };

        const resp = await HttpService.request(parameters);
        let body: any;
        try {
            body = JSON.parse(resp.body);
        } catch (e) {
            throw new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e);
        }
        if (body.error != null && body.error === true) {
            if (body.description != null) {
                throw new VaultageError(ERROR_CODE.SERVER_ERROR, body.description);
            } else {
                throw new VaultageError(ERROR_CODE.SERVER_ERROR, 'Unknown server error');
            }
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

        const resp = await HttpService.request(parameters);

        let body: any;
        try {
            body = JSON.parse(resp.body);
        } catch (e) {
            throw new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e);
        }
        if (body.error != null && body.error === true) {
            if (body.not_fast_forward === true) {
                throw new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, 'The server has a newer version of the DB');
            } else if (body.descrption != null) {
                throw new VaultageError(ERROR_CODE.SERVER_ERROR, body.description);
            } else {
                throw new VaultageError(ERROR_CODE.SERVER_ERROR, 'Unknown server error');
            }
        }
    }

    private static _makeURL(serverURL: string, username: string, remotePwdHash: string): string {
        return `${serverURL}/${encodeURIComponent(username)}/${remotePwdHash}/vaultage_api`;
    }
}

