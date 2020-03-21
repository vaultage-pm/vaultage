import 'reflect-metadata';

import express from 'express';
import { anything, instance, Mock, mock, when, verify } from 'omnimock';
import request from 'supertest';
import { PushPullResponse, UpdateCipherRequest, VaultageConfig } from 'vaultage-protocol';

import { ApiService } from './api-service';
import { AuthenticationError } from './storage/AuthenticationError';
import { DatabaseWithAuth, IDatabase } from './storage/Database';
import { NotFastForwardError } from './storage/NotFastForwardError';
import { DemoModeError } from './storage/DemoModeError';


const mockConfig = (): VaultageConfig => ({
    version: 1,
    salts: {
        local_key_salt: 'le salt',
        remote_key_salt: 'other salt'
    },
    demo: false,
});

const okPushResponse: PushPullResponse = {
    error: false,
    data: 'save OK'
};

const okPullResponse: PushPullResponse = {
    error: false,
    data: 'load OK'
};

describe('The vaultage API', () => {

    let app: express.Application;
    let mockDB: Mock<IDatabase>;
    let mockAuthDB: Mock<DatabaseWithAuth>;

    beforeEach(() => {
        mockDB = mock<IDatabase>('mockDB');
        mockAuthDB = mock<DatabaseWithAuth>('mockAuthDB');

        const service = new ApiService(mockConfig(), instance(mockAuthDB));
        app = service.createVaultageAPIServer();
    });

    afterEach(() => {
        verify(mockDB);
        verify(mockAuthDB);
    })

    describe('GET /:user/:key/vaultage_api', () => {
        it('returns the cipher', (done) => {
            when(mockDB.load()).resolve('load OK');
            when(mockAuthDB.auth({username: 'a', password: 'b'})).resolve(instance(mockDB));
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
            when(mockAuthDB.auth({username: 'a', password: 'b'})).reject(new AuthenticationError());
            request(app)
                .get('/a/b/vaultage_api')
                .set('Accept', 'application/json')
                .expect(200, okPullResponse, (_err, res) => {
                    expect(res.body).toEqual({
                        error: true,
                        description: expect.any(String),
                        code: 'EAUTH'
                    });
                    done();
                });
        });
    });

    describe('POST /:user/:key/vaultage_api', () => {
        it('sets the cipher and returns it', (done) => {
            when(mockDB.save(anything())).resolve('save OK');
            when(mockAuthDB.auth({username: 'a', password: 'b'})).resolve(instance(mockDB));
            const updateRequest: UpdateCipherRequest = {
                force: false,
                new_data: 'new_data',
                new_hash: 'new_h4$h',
                old_hash: 'old_h4$h',
                new_password: ''
            };
            request(app)
                .post('/a/b/vaultage_api')
                .send(updateRequest)
                .set('Accept', 'application/json')
                .expect(200, okPushResponse, (err, res) => {
                    if (err) {
                        console.log(res.body);
                        throw err;
                    }
                    done();
                });
        });

        it('returns an error on DB auth error', (done) => {
            when(mockAuthDB.auth(anything())).reject(new AuthenticationError());
            const updateRequest: UpdateCipherRequest = {
                force: false,
                new_data: 'new_data',
                new_hash: 'new_h4$h',
                old_hash: 'old_h4$h',
                new_password: ''
            };
            request(app)
                .post('/a/b/vaultage_api')
                .send(updateRequest)
                .set('Accept', 'application/json')
                .expect(200, okPullResponse, (_err, res) => {
                    expect(res.body).toEqual({
                        error: true,
                        description: expect.any(String),
                        code: 'EAUTH'
                    });
                    done();
                });
        });

        it('returns an error when not fast forward', (done) => {
            when(mockAuthDB.auth({username: 'a', password: 'b'})).resolve(instance(mockDB));
            when(mockDB.save(anything())).reject(new NotFastForwardError());
            const updateRequest: UpdateCipherRequest = {
                force: false,
                new_data: 'new_data',
                new_hash: 'new_h4$h',
                old_hash: 'wrong_hash',
                new_password: ''
            };
            request(app)
                .post('/a/b/vaultage_api')
                .send(updateRequest)
                .set('Accept', 'application/json')
                .expect(200, {
                    error: true,
                    description: 'Not fast forward',
                    code: 'EFAST'
                })
                .end(done);
        });

        it('returns when pushing in demo mode', (done) => {
            const service = new ApiService({...mockConfig(), demo: true}, instance(mockAuthDB));
            app = service.createVaultageAPIServer();

            when(mockAuthDB.auth({username: 'a', password: 'b'})).resolve(instance(mockDB));
            when(mockDB.save(anything())).reject(new DemoModeError());
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
                .expect(200, {
                    error: true,
                    description: 'Server in demo mode',
                    code: 'EDEMO'
                })
                .end(done);
        });
    });

    describe('GET /config', () => {
        it('returns the same config provided upon initialization', (done) => {
            request(app)
                .get('/config')
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(200, mockConfig())
                .end(done);
        });
    });
});
