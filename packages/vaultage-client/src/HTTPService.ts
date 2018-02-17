import axios, { AxiosRequestConfig } from 'axios';

import { ERROR_CODE, VaultageError } from './VaultageError';

export interface IHttpResponse<T> {
    data: T;
}
export type HttpRequestParameters = AxiosRequestConfig;
export type HttpRequestFunction = <T>(parameters: HttpRequestParameters) => Promise<IHttpResponse<T>>;

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
