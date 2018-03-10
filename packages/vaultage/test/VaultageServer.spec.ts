import 'reflect-metadata';

import { useContainer } from 'routing-controllers';
import * as request from 'supertest';
import { Container } from 'typedi';
import { IVaultageConfig, PushPullResponse, UpdateCipherRequest } from 'vaultage-protocol';

import { createVaultageAPIServer } from '../src/apiServer';
import { AuthenticationError } from '../src/storage/AuthenticationError';
import { DatabaseWithAuth } from '../src/storage/Database';
import * as db from '../src/storage/JSONDatabase';
import { NotFastForwardError } from '../src/storage/NotFastForwardError';

useContainer(Container);

const mockModule = jest.genMockFromModule('../src/storage/JSONDatabase') as typeof db;
const mockAuthDB = new mockModule.JSONDatabaseWithAuth();
const mockDB = new mockModule.JSONDatabase('', '', '');
(mockAuthDB.auth as jest.Mock).mockImplementation(() => Promise.resolve(mockDB));
(mockDB.load as jest.Mock).mockImplementation(() => Promise.resolve('load OK'));
(mockDB.save as jest.Mock).mockImplementation(() => Promise.resolve('save OK'));

const mockConfig: IVaultageConfig = {
    version: 1,
    salts: {
        local_key_salt: 'le salt',
        remote_key_salt: 'other salt'
    }
};

Container.set(DatabaseWithAuth, mockAuthDB);
// Inject a copy to keep the original intact in case something messes up inside the app
Container.set('config', {...mockConfig});

const app = createVaultageAPIServer();

const okPushResponse: PushPullResponse = {
    error: false,
    data: 'save OK'
};

const okPullResponse: PushPullResponse = {
    error: false,
    data: 'load OK'
};

describe('The vaultage API', () => {

    describe('GET /:user/:key/vaultage_api', () => {
        it('returns the cipher', (done) => {
            request(app)
                .get('/a/b/vaultage_api')
                .set('Accept', 'application/json')
                .expect(200, okPullResponse, (err, res) => {
                    if (err) {
                        console.log(res.body);
                        throw err;
                    }
                    expect(res.body).toEqual({
                        error: false,
                        data: 'load OK'
                    });
                    done();
                });
        });

        it('returns an error on DB auth error', (done) => {
            (mockAuthDB.auth as jest.Mock).mockImplementationOnce(() => Promise.reject(new AuthenticationError()));
            request(app)
                .get('/a/b/vaultage_api')
                .set('Accept', 'application/json')
                .expect(200, okPullResponse, (_err, res) => {
                    expect(res.body).toEqual({
                        error: true,
                        description: expect.any(String),
                        code: 'EAUTH'
                    });
                    expect(mockDB.load).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('POST /:user/:key/vaultage_api', () => {
        it('sets the cipher and returns it', (done) => {
            request(app)
                .post('/a/b/vaultage_api')
                .send({
                    force: false,
                    new_data: 'new_data',
                    new_hash: 'new_h4$h',
                    old_hash: 'old_h4$h',
                    update_key: ''
                } as UpdateCipherRequest)
                .set('Accept', 'application/json')
                .expect(200, okPushResponse, (err, res) => {
                    if (err) {
                        console.log(res.body);
                        throw err;
                    }
                    expect(mockAuthDB.auth).toHaveBeenCalledTimes(1);
                    expect(mockAuthDB.auth).toHaveBeenCalledWith({
                        username: 'a',
                        password: 'b'
                    });
                    expect(mockDB.save).toHaveBeenCalledTimes(1);
                    done();
                });
        });

        it('returns an error on DB auth error', (done) => {
            (mockAuthDB.auth as jest.Mock).mockImplementationOnce(() => Promise.reject(new AuthenticationError()));
            request(app)
                .post('/a/b/vaultage_api')
                .send({
                    force: false,
                    new_data: 'new_data',
                    new_hash: 'new_h4$h',
                    old_hash: 'old_h4$h',
                    update_key: ''
                } as UpdateCipherRequest)
                .set('Accept', 'application/json')
                .expect(200, okPullResponse, (_err, res) => {
                    expect(res.body).toEqual({
                        error: true,
                        description: expect.any(String),
                        code: 'EAUTH'
                    });
                    expect(mockDB.load).not.toHaveBeenCalled();
                    done();
                });
        });

        it('returns an error when not fast forward', (done) => {
            (mockDB.save as jest.Mock).mockImplementationOnce(() => Promise.reject(new NotFastForwardError()));
            request(app)
                .post('/a/b/vaultage_api')
                .send({
                    force: false,
                    new_data: 'new_data',
                    new_hash: 'new_h4$h',
                    old_hash: 'wrong_hash',
                    update_key: ''
                } as UpdateCipherRequest)
                .set('Accept', 'application/json')
                .expect(200, okPushResponse, (_err, res) => {
                    expect(res.body).toEqual({
                        error: true,
                        description: expect.any(String),
                        code: 'EFAST'
                    });
                    expect(mockDB.load).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('GET /config', () => {
        it('returns the same config provided upon initialization', (done) => {
            request(app)
                .get('/config')
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(200, mockConfig, done);
        });
    });
});
