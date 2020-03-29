import { injectable } from 'tsyringe';
import { api, UpdateCipherRequest, VaultageConfig } from 'vaultage-protocol';

import { IHttpParams } from '../interface';
import { ICredentials } from '../vault/Vault';
import { ERROR_CODE, VaultageError } from '../VaultageError';
import { ResponseUtils } from './response-utils';
import { TransportPrimitivesProvider } from './transport-primitives-provider';


/**
 * Client-side of the HTTP interface between the Vaultage server and the client.
 *
 * This class strictly takes care of formatting the data to proper HTTP payloads and
 * sending them over the wire (or to the mock HTTP interface if it is mocked).
 * This class does not handle crypto stuff.
 */
@injectable()
export class HttpApi {

    constructor(
            private readonly transport: TransportPrimitivesProvider,
            private readonly responseUtils: ResponseUtils) {}

    public pullConfig(serverURL: string, httpParams?: IHttpParams): Promise<VaultageConfig> {
        return this.createConsumer(serverURL, httpParams)
                .pullConfig()
                .then(c => c.data)
                .catch(e => Promise.reject(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e)));
    }

    public pullCipher(creds: ICredentials, httpParams?: IHttpParams): Promise<string> {
        return this.createConsumer(creds.serverURL, httpParams)
                .pullCipher({
                    params: creds
                })
                .catch(e => Promise.reject(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e)))
                .then(resp => {
                    const body = resp.data;
                    this.responseUtils.checkResponseBody(body);
                    return body.data.replace(/[^a-z0-9+/:"{},]/ig, '');
                });
    }

    public pushCipher(
            creds: ICredentials,
            newRemoteKey: (string|null),
            cipher: string,
            lastFingerprint: string | undefined,
            fingerprint: string,
            httpParams?: IHttpParams): Promise<void> {

        const request: UpdateCipherRequest = {
            new_password: newRemoteKey || undefined,
            new_data: cipher,
            old_hash: lastFingerprint,
            new_hash: fingerprint,
            force: false
        };

        return this.createConsumer(creds.serverURL, httpParams)
                .pushCipher({
                    params: creds,
                    body: request
                })
                .catch(e => Promise.reject(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Bad server response', e)))
                .then(resp => {
                    const body = resp.data;
                    this.responseUtils.checkResponseBody(body);
                });
    }

    private createConsumer(serverURL: string, httpParams?: IHttpParams) {
        return this.transport.createConsumer(api, this.transport.axios.create({
            baseURL: serverURL,
            ...httpParams
        }));
    }
}

