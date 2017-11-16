import 'reflect-metadata';

import { useContainer } from 'routing-controllers';
import * as request from 'supertest';
import { Container } from 'typedi';

import { VaultageConfig } from '../dist/src/VaultageConfig';
import { createVaultageAPIServer } from '../src/apiServer';
import { IPushPullResponse } from '../src/messages/PullResponse';
import { UpdateCipherRequest } from '../src/messages/UpdateCipherRequest';
import { DatabaseWithAuth } from '../src/storage/Database';
import * as db from '../src/storage/JSONDatabase';

useContainer(Container);

const mockModule = jest.genMockFromModule('../src/storage/JSONDatabase') as typeof db;
const mockAuthDB = new mockModule.JSONDatabaseWithAuth();
const mockDB = new mockModule.JSONDatabase('', '', '');
(mockAuthDB.auth as jest.Mock).mockReturnValue(Promise.resolve(mockDB));
(mockDB.load as jest.Mock).mockReturnValue(Promise.resolve('load OK'));
(mockDB.save as jest.Mock).mockReturnValue(Promise.resolve('save OK'));

const mockConfig: VaultageConfig = {
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
        it('Pull cipher action is not implemented', (done) => {
            request(app)
                .get('/a/b/vaultage_api')
                .set('Accept', 'text/plain')
                .expect(200, okPullResponse, (err, res) => {
                    if (err) {
                        console.log(res.body);
                        throw err;
                    }
                    expect(mockAuthDB.auth).toHaveBeenCalledTimes(1);
                    expect(mockAuthDB.auth).toHaveBeenCalledWith({
                        username: 'a',
                        password: 'b'
                    });
                    expect(mockDB.load).toHaveBeenCalledTimes(1);
                    done();
                });
        });
    });

    describe('POST /:user/:key/vaultage_api', () => {
        it('Push cipher action is not implemented', (done) => {
            request(app)
                .post('/a/b/vaultage_api')
                .send({
                    force: false,
                    new_data: 'new_data',
                    new_hash: 'new_h4$h',
                    old_hash: 'old_h4$h',
                    update_key: ''
                } as UpdateCipherRequest)
                .set('Accept', 'text/plain')
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
