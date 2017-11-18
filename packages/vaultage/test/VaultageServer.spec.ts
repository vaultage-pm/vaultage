import 'reflect-metadata';

import { useContainer } from 'routing-controllers';
import * as request from 'supertest';
import { Container } from 'typedi';

import { createVaultageAPIServer } from '../src/apiServer';
import { IPushPullResponse } from '../src/messages/PullResponse';
import { UpdateCipherRequest } from '../src/messages/UpdateCipherRequest';
import { AuthenticationError } from '../src/storage/AuthenticationError';
import { DatabaseWithAuth } from '../src/storage/Database';
import * as db from '../src/storage/JSONDatabase';
import { IVaultageConfig } from '../src/VaultageConfig';

useContainer(Container);

const mockModule = jest.genMockFromModule('../src/storage/JSONDatabase') as typeof db;
const mockAuthDB = new mockModule.JSONDatabaseWithAuth();
const mockDB = new mockModule.JSONDatabase('', '', '');
(mockAuthDB.auth as jest.Mock).mockImplementation(() => Promise.resolve(mockDB));
(mockDB.load as jest.Mock).mockReturnValue(Promise.resolve('load OK'));
(mockDB.save as jest.Mock).mockReturnValue(Promise.resolve('save OK'));

const mockConfig: IVaultageConfig = {
    salts: {
        USERNAME_SALT: 'le salt'
    }
};

Container.set(DatabaseWithAuth, mockAuthDB);
// Inject a copy to keep the original intact in case something messes up inside the app
Container.set('config', {...mockConfig});

const app = createVaultageAPIServer();

const okPushResponse: IPushPullResponse = {
    error: false,
    description: '',
    data: 'save OK'
};

const okPullResponse: IPushPullResponse = {
    error: false,
    description: '',
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
                        description: '',
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
                        description: 'Error: Invalid credentials',
                        data: ''
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
                        description: 'Error: Invalid credentials',
                        data: ''
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
