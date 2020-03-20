import 'reflect-metadata';
import { useContainer } from 'routing-controllers';
import request from 'supertest';
import { Container } from 'typedi';
import { IVaultageConfig, PushPullResponse, UpdateCipherRequest } from 'vaultage-protocol';
import { DemoModeError } from 'vaultage/src/storage/DemoModeError';
import { createVaultageAPIServer } from '../../src/apiServer';
import { DatabaseWithAuth } from '../../src/storage/Database';
import * as db from '../../src/storage/JSONDatabase';

useContainer(Container);

const mockModule = jest.genMockFromModule('../../src/storage/JSONDatabase') as typeof db;
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
    },
    demo: true
};

Container.set(DatabaseWithAuth, mockAuthDB);
// Inject a copy to keep the original intact in case something messes up inside the app
Container.set('config', {...mockConfig});

const app = createVaultageAPIServer();

const okPushResponse: PushPullResponse = {
    error: false,
    data: 'save OK'
};

describe('The vaultage API', () => {
    describe('POST /:user/:key/vaultage_api', () => {
        it('returns when pushing in demo mode', (done) => {
            (mockDB.save as jest.Mock).mockImplementationOnce(() => Promise.reject(new DemoModeError()));
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
                        code: 'EDEMO'
                    });
                    expect(mockDB.load).not.toHaveBeenCalled();
                    done();
                });
        });
    });
});
