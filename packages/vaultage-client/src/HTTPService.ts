import * as request from 'request';

import { ERROR_CODE, VaultageError } from './VaultageError';

export type ApiCallFunction = (parameters: any) => Promise<any>;

/**
 * Singleton providing outgoing HTTP capabilities.
 * Allows test code to mock the network.
 */
export abstract class HttpService {

    public static get request(): ApiCallFunction {
        return this._instance;
    }

    public static mock(fn: ApiCallFunction): void {
        this._instance = fn;
    }

    private static _instance: ApiCallFunction = (parameters: any) => {
        return new Promise((resolve, reject) => request(parameters, (err, res) => {
            if (err) {
                reject(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
            } else {
                resolve(res);
            }
        }));
    }
}
