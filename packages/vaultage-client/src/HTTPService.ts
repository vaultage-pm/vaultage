import * as request from 'request';

export type ApiCallFunction = (parameters: any, cb: (err: any, resp: any) => void) => void;

// Singleton providing outgoing HTTP capabilities.
// Allows test code to mock the network
export abstract class HTTPService {

    private static _instance: ApiCallFunction = (parameters: any, cb: (err: any, resp: any) => void) => {
        request(parameters, cb);
    };

    static get request(): ApiCallFunction {
        return this._instance;
    }

    static mock(fn: ApiCallFunction): void {
        this._instance = fn;
    }
}
