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
        const vault = new Vault(creds, crypto);
        expect(vault.getAllEntries().length).toBe(0);
    });

    it('can create a Vault with a mock API, which interacts with a fake server', async () => {
        const vault = new Vault(creds, crypto);

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
        const vault = new Vault(creds, crypto);

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
