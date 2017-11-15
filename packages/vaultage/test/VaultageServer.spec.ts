import * as express from 'express';
import * as request from 'supertest';
import 'core-js/es7/reflect'

import { VaultageServer } from '../src/VaultageServer';

const app = express();

VaultageServer.newServer(app, {
    salts: {
        USERNAME_SALT: 'thetest'
    }
});

describe('The vaultage API', () => {
    describe('GET /:user/:key/cipher', () => {
        it('Pull cipher action is not implemented', done => {
            request(app)
                .get('/a/b/cipher')
                .set('Accept', 'text/plain')
                .expect(200, 'Action pull', done);
        });
    });

    describe('POST /:user/:key/cipher', () => {
        it('Push cipher action is not implemented', done => {
            request(app)
                .post('/a/b/cipher')
                .set('Accept', 'text/plain')
                .expect(200, 'Action push', done);
        });
    });

    describe('GET /:user/:key/key', () => {
        it('Key rotation action is not implemented', done => {
            request(app)
                .post('/a/b/key')
                .set('Accept', 'text/plain')
                .expect(200, 'Action changekey', done);
        });
    });

    describe('GET /config', () => {
        it('returns the same config provided upon initialization', done => {
            request(app)
                .get('/config')
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(200, {
                    salts: {
                        USERNAME_SALT: 'thetest'
                    }
                }, done);
        });
    });
});
