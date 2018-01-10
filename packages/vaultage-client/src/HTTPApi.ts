import { IVaultageConfig } from '../../vaultage/src/apiServer';
import { HttpService } from './HTTPService';
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

    public static pullConfig(serverURL: string, cb: (err: (VaultageError|null), config?: IVaultageConfig) => void): void {
        HttpService.request({
            url: serverURL + '/config'
        }, (err, res) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
            }
            try {
                cb(null, JSON.parse(res.body));
            } catch (e) {
                cb(e);
            }
        });
    }

    public static pullCipher(creds: ICredentials, cb: (err: (VaultageError|null), cipher?: string) => void): void {

        const parameters = {
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey)
        };
        const innerCallback = (err: any, resp: any) => {

            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
            }

            let body: any;
            try {
                body = JSON.parse(resp.body);
            } catch (e) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response'));
            }
            if (body.error != null && body.error === true) {
                if (body.description != null) {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, body.description));
                } else {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, 'Unknown server error'));
                }
            }
            const cipher = (body.data || '').replace(/[^a-z0-9+/:"{},]/ig, '');

            cb(null, cipher);
        };

        HttpService.request(parameters, innerCallback);
    }

    public static pushCipher(
            creds: ICredentials,
            newRemoteKey: (string|null),
            cipher: string,
            lastFingerprint: string | undefined,
            fingerprint: string,
            cb: (err: (VaultageError|null)) => void): void {

        const parameters = {
            method: 'POST',
            url: this._makeURL(creds.serverURL, creds.username, creds.remoteKey),
            body: JSON.stringify({
                new_password: newRemoteKey,
                new_data: cipher,
                old_hash: lastFingerprint,
                new_hash: fingerprint,
                force: false,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        HttpService.request(parameters, (err: any, resp: any) => {
            if (err) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err));
            }

            let body: any;
            try {
                body = JSON.parse(resp.body);
            } catch (e) {
                return cb(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response'));
            }
            if (body.error != null && body.error === true) {
                if (body.not_fast_forward === true) {
                    return cb(new VaultageError(ERROR_CODE.NOT_FAST_FORWARD, 'The server has a newer version of the DB'));
                } else if (body.descrption != null) {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, body.description));
                } else {
                    return cb(new VaultageError(ERROR_CODE.SERVER_ERROR, 'Unknown server error'));
                }
            }
            cb(null);
        });
    }

    private static _makeURL(serverURL: string, username: string, remotePwdHash: string): string {
        return `${serverURL}/${encodeURIComponent(username)}/${remotePwdHash}/vaultage_api`;
    }
}

