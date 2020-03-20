import axios, { AxiosRequestConfig } from 'axios';
import { injectable } from 'tsyringe';

import { ERROR_CODE, VaultageError } from '../VaultageError';

export interface IHttpResponse<T> {
    data: T;
}
export type HttpRequestParameters = AxiosRequestConfig;
export type HttpRequestFunction = <T>(parameters: HttpRequestParameters) => Promise<IHttpResponse<T>>;

/**
 * Singleton providing outgoing HTTP capabilities.
 * Allows test code to mock the network.
 */
@injectable()
export class HttpService {

    public get request(): HttpRequestFunction {
        return this._instance;
    }

    public mock(fn: HttpRequestFunction): void {
        this._instance = fn;
    }

    private _instance: HttpRequestFunction = (parameters: HttpRequestParameters) => {
        return axios.request(parameters).catch((err) => {
            if (err.response) {
                if (err.response.status >= 500 && err.response.status < 600) {
                    return Promise.reject(new VaultageError(ERROR_CODE.SERVER_ERROR, 'Server error', err.toString()));
                } else if (err.response.status === 401) {
                    return Promise.reject(new VaultageError(ERROR_CODE.NOT_AUTHORIZED, 'Authorization error', err.toString()));
                }
            }
            return Promise.reject(new VaultageError(ERROR_CODE.NETWORK_ERROR, 'Network error', err.toString()));
        });
    }
}
