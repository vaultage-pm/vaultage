import { IVaultageConfig } from '../../vaultage/src/VaultageConfig';
import { HttpService } from '../src/HTTPService';
import { Vault } from '../src/Vault';
import { login } from '../src/vaultage';
import { ERROR_CODE } from '../src/VaultageError';

const config: IVaultageConfig = {
    salts: { local_key_salt: 'deadbeef', remote_key_salt: '0123456789'},
    version: 1,
    default_user: 'John'
};

describe('login', () => {
    let mockAPI: jest.Mock;

    beforeEach(() => {
        mockAPI = jest.fn();
        HttpService.mock(mockAPI);
    });

    it('detects an unreachable remote', async () => {
        mockAPI.mockImplementationOnce((_parameters, cb) => {
            // bad luck, server unreachable
            cb('404 error', null);
        });

        await expect(login('url', 'username', 'passwd')).rejects.toHaveProperty('code', ERROR_CODE.NETWORK_ERROR);

        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/config'
        }, expect.any(Function));
    });

    it('detects a login error', async () => {

        mockAPI.mockImplementationOnce((_parameters, cb) => {
            cb(null, { body: JSON.stringify(config)});
        });
        mockAPI.mockImplementationOnce((_parameters, cb) => {
            // bad luck, server reachable but wrong credentials
            cb(null, { body: '{"error":true,"description":"Error, authentication failed."}'});
        });

        await expect(login('url', 'username', 'passwd')).rejects.toHaveProperty('code', ERROR_CODE.SERVER_ERROR);

        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/config'
        }, expect.any(Function));
        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        }, expect.any(Function));
    });

    it('creates a vault on success', async () => {

        mockAPI.mockImplementationOnce((_parameters, cb) => {
            cb(null, { body: JSON.stringify(config)});
        });
        mockAPI.mockImplementationOnce((_parameters, cb) => {
            cb(null, {
                body: '{"error":false,"description":"","data":""}'
            });
        });

        const vault = await login('url', 'username', 'passwd');

        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/config'
        }, expect.any(Function));
        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        }, expect.any(Function));

        expect(vault).toBeInstanceOf(Vault);
    });
});
