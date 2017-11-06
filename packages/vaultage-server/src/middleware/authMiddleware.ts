import * as express from 'express';

export function auth(request: express.Request, _response: express.Response, next: (err?: any) => any): any {
    console.log(request.params);
    next();
}