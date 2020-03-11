import { Crypto } from '../src/Crypto';
import { HttpService, IHttpResponse } from '../src/HTTPService';
import { ICredentials, Vault } from '../src/Vault';

const creds: ICredentials = {
    localKey: 'the_local_key',
    remoteKey: 'the_remote_key',
    serverURL: 'http://url',
    username: 'john cena'
};

const crypto = new Crypto({
    LOCAL_KEY_SALT: 'deadbeef',
    REMOTE_KEY_SALT: '0123456789',
});

function response<T>(data: T): IHttpResponse<T> {
    return {
        data
    };
}

let mockAPI: jest.Mock;

describe('Vault.ts can', () => {

    beforeEach(() => {
        mockAPI = jest.fn();
        HttpService.mock(mockAPI);
    });

    it('create an empty vault', () => {
        const vault = new Vault(creds, crypto, undefined);
        expect(vault.getAllEntries().length).toBe(0);
    });

    it('can create a Vault with a mock API, which interacts with a fake server', async () => {
        const vault = new Vault(creds, crypto, undefined);

        // add one entry
        vault.addEntry({
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        });

        expect(vault.getAllEntries().length).toBe(1);
        expect(mockAPI).not.toHaveBeenCalled();

        mockAPI.mockImplementationOnce((_parameters) => {
            // encrypted with master password 'passwd'. DB contains a single object Object:
            // {id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr',
            // created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
            return Promise.resolve(response({
                error: false,
                // tslint:disable-next-line:max-line-length
                data: '{"iv":"32CPCDg5TZfwMxTAkoxNnA==","v":1,"iter":10000,;"ks";:128,;"ts";:64,;"mode";:"ccm",;"adata";:"",;"cipher";:"aes",;"salt";:"2xgYuLeaI70=",;"ct";:"VP8hRnz0h71X0AycacRmDZVy6eCjglxTMGm\/MgFxDv3YiaSHMaIxfX2Krx6IDmHZGs1KLCmZWpgqW+NxUAdo6iIhTE7yQ2+JPY4iyvtEdvCJpMY9hGPxLACFC7i7JWLkNOSgeIOj9lO5SJBVtE5DASXfW68GZjTM0rc6PevuWQyAwwTwlnoLxQivodU0hH0w6LeUDXbpPtZGbP2vmiNuFs9haj1VRhrnHFUwRUTY\/mSE1JtClMvhjwjyfTYQdXjGA2qr9XBMiQWNFkA=";}'
            }));
        });

        // save the current vault
        await vault.save();

        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://url/john%20cena/the_remote_key/vaultage_api',
            method: 'POST',
        }));

        const entry = vault.getEntry('0');
        expect(entry.title).toEqual('Hello');
        expect(entry.url).toEqual('http://example.com');
        expect(entry.login).toEqual('Bob');
        expect(entry.password).toEqual('zephyr');
    });

    it('can create a Vault with a mock API, and play with entries', async () => {
        const vault = new Vault(creds, crypto, undefined);

        // add one entry
        vault.addEntry({
            title: 'github',
            login: 'json',
            password: 'zephyr',
            url: 'http://github.com'
        });

        expect(vault.getAllEntries().length).toBe(1);

        // add one entry
        vault.addEntry({
            title: 'gitlab',
            login: 'jasongit',
            password: 'jackson',
            url: 'http://lab.git.com'
        });

        expect(vault.getAllEntries().length).toBe(2);

        const entries2 = vault.getWeakPasswords();
        expect(entries2.length).toEqual(2);

        vault.updateEntry('0', {
            password: 'N1N$a23489zasdél123',
        });

        const entries = vault.findEntries('git');
        expect(entries.length).toEqual(2);
        expect(entries[0].title).toEqual('gitlab');
        expect(entries[1].title).toEqual('github');

        const entries3 = vault.getWeakPasswords();
        expect(entries3.length).toEqual(1);
        expect(entries3[0].title).toEqual('gitlab');
    });


    it('can create a Vault by pulling a mock API', async () => {
        const creds2: ICredentials = {
            localKey: 'the_local_key',
            remoteKey: 'the_remote_key',
            serverURL: 'http://url',
            username: 'john cena'
        };
        const vault = new Vault(creds2, crypto, undefined);

        expect(vault.getAllEntries().length).toBe(0);
        expect(mockAPI).not.toHaveBeenCalled();

        mockAPI.mockImplementationOnce((_parameters) => {
            // encrypted with master password 'the_local_key'. DB contains a single object Object:
            // {id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr',
            // created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
            return Promise.resolve(response({
                error: false,
                // tslint:disable-next-line:max-line-length
                data: '{"iv":"cGBEwUfGmZD9w2/xo8TBow==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"QTFhFByDdWM=","ct":"1akmXM9BIP4kgDlYdbDCwL3yHYpjtOSrdZfTWi/MskyiJdnEZgQGD9o4yGr53hvGIbePC1yrLoWGTHy4Y6USxmMy8ovxtxF2z6TKWsN7EsWl8rdE+w7xT8Aj7qge2iKS2wqmF5XqggRa01Phclb1tFCxjCTGDeQcTl2JGijO490SCq1EYIr+XGjCy6I5K4sd3xDBY7UtUgnNZLr8+eHHhCkO9joMSwDvdRCZqgqA3GUjS57tYvU9ubZ0HvGN7HN6vAoArxeJqiPzvzQcSgsTTcC+jD0FmIuWRtueHhM6hNONYWOgZefhxI8Fb40PQ0UFYHLU9ihncsSln7Q7Cd7dUfL8RzbUkLbOnEc25Mt+tSnO3CgaHMvff0XidoyDxJnNQcyR6wzuqMqkCg=="}'
            }));
        });

        // pull the current vault
        await vault.pull();

        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://url/john%20cena/the_remote_key/vaultage_api'
        }));

        expect(vault.getAllEntries().length).toBe(1);

        const entry = vault.getEntry('0');
        expect(entry.title).toEqual('Hello');
        expect(entry.url).toEqual('http://example.com');
        expect(entry.login).toEqual('Bob');
        expect(entry.password).toEqual('zephyr');
    });

    it('can create a Vault with a mock API and automatically merge edited things', async () => {
        const creds2: ICredentials = {
            localKey: 'the_local_key',
            remoteKey: 'the_remote_key',
            serverURL: 'http://url',
            username: 'john cena'
        };
        const vault = new Vault(creds2, crypto, undefined);

        // add one entry which will be exactly the same as the one in the DB - only with higher usage count
        vault.addEntry({
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        });
        vault.entryUsed('0');

        expect(vault.getAllEntries().length).toBe(1);
        expect(mockAPI).not.toHaveBeenCalled();

        mockAPI.mockImplementationOnce((_parameters) => {
            // encrypted with master password 'the_local_key'. DB contains a single object Object:
            // {id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr',
            // created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
            return Promise.resolve(response({
                error: false,
                // tslint:disable-next-line:max-line-length
                data: '{"iv":"cGBEwUfGmZD9w2/xo8TBow==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"QTFhFByDdWM=","ct":"1akmXM9BIP4kgDlYdbDCwL3yHYpjtOSrdZfTWi/MskyiJdnEZgQGD9o4yGr53hvGIbePC1yrLoWGTHy4Y6USxmMy8ovxtxF2z6TKWsN7EsWl8rdE+w7xT8Aj7qge2iKS2wqmF5XqggRa01Phclb1tFCxjCTGDeQcTl2JGijO490SCq1EYIr+XGjCy6I5K4sd3xDBY7UtUgnNZLr8+eHHhCkO9joMSwDvdRCZqgqA3GUjS57tYvU9ubZ0HvGN7HN6vAoArxeJqiPzvzQcSgsTTcC+jD0FmIuWRtueHhM6hNONYWOgZefhxI8Fb40PQ0UFYHLU9ihncsSln7Q7Cd7dUfL8RzbUkLbOnEc25Mt+tSnO3CgaHMvff0XidoyDxJnNQcyR6wzuqMqkCg=="}'
            }));
        });

        // pull the current vault
        await vault.pull();

        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://url/john%20cena/the_remote_key/vaultage_api'
        }));

        const entry = vault.getEntry('0');
        expect(entry.title).toEqual('Hello');
        expect(entry.url).toEqual('http://example.com');
        expect(entry.login).toEqual('Bob');
        expect(entry.password).toEqual('zephyr');
        expect(entry.usage_count).toEqual(1);
    });

    it('can create a Vault with a mock API and automatically merge new things', async () => {
        const creds2: ICredentials = {
            localKey: 'the_local_key',
            remoteKey: 'the_remote_key',
            serverURL: 'http://url',
            username: 'john cena'
        };
        const vault = new Vault(creds2, crypto, undefined);

        // add one entry which will be exactly the same as the one in the DB - only with higher usage count
        vault.addEntry({
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        });
        vault.entryUsed('0');
        vault.addEntry({
            title: 'A totally new entry',
            login: 'new login',
            password: 'new password',
            url: 'http://example2.com'
        });

        expect(vault.getAllEntries().length).toBe(2);
        expect(mockAPI).not.toHaveBeenCalled();

        mockAPI.mockImplementationOnce((_parameters) => {
            // encrypted with master password 'the_local_key'. DB contains a single object Object:
            // {id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr',
            // created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
            // its fingerprint is 7103083b1245cf7843cd4d7dee33301b4bb70ecee5c8e531fecb874120d6f1ba
            return Promise.resolve(response({
                error: false,
                // tslint:disable-next-line:max-line-length
                data: '{"iv":"cGBEwUfGmZD9w2/xo8TBow==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"QTFhFByDdWM=","ct":"1akmXM9BIP4kgDlYdbDCwL3yHYpjtOSrdZfTWi/MskyiJdnEZgQGD9o4yGr53hvGIbePC1yrLoWGTHy4Y6USxmMy8ovxtxF2z6TKWsN7EsWl8rdE+w7xT8Aj7qge2iKS2wqmF5XqggRa01Phclb1tFCxjCTGDeQcTl2JGijO490SCq1EYIr+XGjCy6I5K4sd3xDBY7UtUgnNZLr8+eHHhCkO9joMSwDvdRCZqgqA3GUjS57tYvU9ubZ0HvGN7HN6vAoArxeJqiPzvzQcSgsTTcC+jD0FmIuWRtueHhM6hNONYWOgZefhxI8Fb40PQ0UFYHLU9ihncsSln7Q7Cd7dUfL8RzbUkLbOnEc25Mt+tSnO3CgaHMvff0XidoyDxJnNQcyR6wzuqMqkCg=="}'
            }));
        });

        // pull the current vault
        await vault.pull();

        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://url/john%20cena/the_remote_key/vaultage_api'
        }));

        const entry = vault.getEntry('0');
        expect(entry.title).toEqual('Hello');
        expect(entry.url).toEqual('http://example.com');
        expect(entry.login).toEqual('Bob');
        expect(entry.password).toEqual('zephyr');
        expect(entry.usage_count).toEqual(1);

        const entry2 = vault.getEntry('1');
        expect(entry2.title).toEqual('A totally new entry');
        expect(entry2.url).toEqual('http://example2.com');
        expect(entry2.login).toEqual('new login');
        expect(entry2.password).toEqual('new password');
        expect(entry2.usage_count).toEqual(0);


        mockAPI = jest.fn();
        HttpService.mock(mockAPI);

        mockAPI.mockImplementationOnce((_parameters) => {
            if (_parameters.data.old_hash !== '7103083b1245cf7843cd4d7dee33301b4bb70ecee5c8e531fecb874120d6f1ba') {
                throw new Error('Wrong old hash !');
            }
            // encrypted with master password 'the_local_key'. DB contains a single object Object:
            // {id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr',
            // created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
            return Promise.resolve(response({
                error: false,
                // tslint:disable-next-line:max-line-length
                data: '{"iv":"cGBEwUfGmZD9w2/xo8TBow==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"QTFhFByDdWM=","ct":"1akmXM9BIP4kgDlYdbDCwL3yHYpjtOSrdZfTWi/MskyiJdnEZgQGD9o4yGr53hvGIbePC1yrLoWGTHy4Y6USxmMy8ovxtxF2z6TKWsN7EsWl8rdE+w7xT8Aj7qge2iKS2wqmF5XqggRa01Phclb1tFCxjCTGDeQcTl2JGijO490SCq1EYIr+XGjCy6I5K4sd3xDBY7UtUgnNZLr8+eHHhCkO9joMSwDvdRCZqgqA3GUjS57tYvU9ubZ0HvGN7HN6vAoArxeJqiPzvzQcSgsTTcC+jD0FmIuWRtueHhM6hNONYWOgZefhxI8Fb40PQ0UFYHLU9ihncsSln7Q7Cd7dUfL8RzbUkLbOnEc25Mt+tSnO3CgaHMvff0XidoyDxJnNQcyR6wzuqMqkCg=="}'
            }));
        });

        await vault.save();
        expect(mockAPI).toHaveBeenCalledTimes(1);
        expect(mockAPI).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://url/john%20cena/the_remote_key/vaultage_api',
            method: 'POST',
        }));
    });

    it('can create a Vault with a mock API, and play with entries', async () => {
        const vault = new Vault(creds, crypto, undefined);

        // add one entry
        vault.addEntry({
            title: 'github',
            login: 'json',
            password: 'zephyr',
            url: 'http://github.com'
        });

        expect(vault.getAllEntries().length).toBe(1);

        // add one entry
        vault.addEntry({
            title: 'gitlab',
            login: 'jasongit',
            password: 'jackson',
            url: 'http://lab.git.com'
        });

        expect(vault.getAllEntries().length).toBe(2);

        const entries2 = vault.getWeakPasswords();
        expect(entries2.length).toEqual(2);

        vault.updateEntry('0', {
            password: 'N1N$a23489zasdél123',
        });

        const entries = vault.findEntries('git');
        expect(entries.length).toEqual(2);
        expect(entries[0].title).toEqual('gitlab');
        expect(entries[1].title).toEqual('github');

        const entries3 = vault.getWeakPasswords();
        expect(entries3.length).toEqual(1);
        expect(entries3[0].title).toEqual('gitlab');
    });
});
