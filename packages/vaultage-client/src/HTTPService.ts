import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { IPushPullResponse } from 'vaultage-protocol';
import { ERROR_CODE, VaultageError } from './VaultageError';

export type HttpRequestParameters = AxiosRequestConfig;
export type HttpResponse<T> = AxiosResponse<T>;
export type HttpRequestFunction = (parameters: HttpRequestParameters) => Promise<AxiosResponse<IPushPullResponse>>;

/**
 * Singleton providing outgoing HTTP capabilities.
 * Allows test code to mock the network.
 */
export abstract class HttpService {

    public static get request(): HttpRequestFunction {
        return this._instance;
    }

    public static mock(fn: HttpRequestFunction): void {
        this._instance = fn;
    }

    private static _instance: HttpRequestFunction = (parameters: HttpRequestParameters) => {
        return axios.request(parameters).catch((err) => Promise.reject(
            new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString())));
    }
}
