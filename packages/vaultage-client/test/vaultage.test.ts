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
        mockAPI.mockImplementationOnce((_parameters) => {
            // bad luck, server unreachable
            return Promise.reject('404 error');
        });

        await expect(login('url', 'username', 'passwd')).rejects.toEqual('404 error');

        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/config'
        });
    });

    it('detects a login error', async () => {

        mockAPI.mockImplementationOnce((_parameters) => {
            return Promise.resolve({ body: JSON.stringify(config)});
        });
        mockAPI.mockImplementationOnce((_parameters) => {
            // bad luck, server reachable but wrong credentials
            return Promise.resolve({ body: '{"error":true,"description":"Error, authentication failed."}'});
        });

        await expect(login('url', 'username', 'passwd')).rejects.toHaveProperty('code', ERROR_CODE.SERVER_ERROR);

        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/config'
        });
        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        });
    });

    it('creates a vault on success', async () => {

        mockAPI.mockImplementationOnce((_parameters) => {
            return Promise.resolve({ body: JSON.stringify(config)});
        });
        mockAPI.mockImplementationOnce((_parameters) => {
            return Promise.resolve({
                body: '{"error":false,"description":"","data":""}'
            });
        });

        const vault = await login('url', 'username', 'passwd');

        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/config'
        });
        expect(mockAPI).toHaveBeenCalledWith({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        });

        expect(vault).toBeInstanceOf(Vault);
    });
});
