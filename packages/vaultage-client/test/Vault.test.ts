import { ApiCallFunction, Vault } from '../src/Vault';
import { ERROR_CODE, VaultageError } from '../src/VaultageError';

import { IVaultageConfig } from '../../vaultage/src/VaultageConfig';

const config: IVaultageConfig = {
    salts: { local_key_salt: 'deadbeef', remote_key_salt: '0123456789'},
    version: 1,
    default_user: 'John'
};

let apiCallsFired: any[] = [];
const mockAPI: ApiCallFunction = (parameters: any, cb: (err: any, resp: any) => void) => {
    apiCallsFired.push({ parameters: parameters, cb: cb });
};

let callbacksFired: any[] = [];
const errorCb = (err: VaultageError) => {
    callbacksFired.push({ err });
};

describe('Vault.ts can', () => {
    it('create an empty vault', () => {
        const vault = new Vault();
        expect(vault).toEqual(vault);
    });
    it('cannot login without credentials', () => {
        const vault = new Vault();
        expect(vault).toEqual(vault);
    });

    it('can create a Vault with a mock API, which detects an unreachable remote', () => {
        apiCallsFired = [];
        callbacksFired = [];

        const vault = new Vault(mockAPI);
        vault.auth('url', 'username', 'passwd', errorCb);

        apiCallsFired[0].cb(null, { body: JSON.stringify(config)});

        expect(apiCallsFired.length).toBe(2); // one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({
            url: 'url/config'
        });
        expect(apiCallsFired[1].parameters).toEqual({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        });

        const apiAnswerFn = apiCallsFired[1].cb;
        apiCallsFired = [];
        callbacksFired = [];

        // bad luck, server unreachable
        apiAnswerFn('404 error', null);

        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1); // Vault got a 404 internally, should throws an error
        expect(callbacksFired[0].err.code).toEqual(ERROR_CODE.NETWORK_ERROR);
    });

    it('can create a Vault with a mock API, which detects a login error', () => {
        apiCallsFired = [];
        callbacksFired = [];

        const vault = new Vault(mockAPI);
        vault.auth('url', 'username', 'passwd', errorCb);

        apiCallsFired[0].cb(null, { body: JSON.stringify(config)});

        expect(apiCallsFired.length).toBe(2); // one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({
            url: 'url/config'
        });
        expect(apiCallsFired[1].parameters).toEqual({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        });

        const apiAnswerFn = apiCallsFired[1].cb;
        apiCallsFired = [];
        callbacksFired = [];

        // bad luck, server reachable but wrong credentials
        apiAnswerFn(null, { body: '{"error":true,"description":"Error, authentication failed."}'});

        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1); // Vault got a 200 OK (but auth failed) internally, should throws an error
        expect(callbacksFired[0].err.code).toEqual(ERROR_CODE.SERVER_ERROR);
    });

    /*

    it('can create a Vault with a mock API, which interacts with a server', () => {
        apiCallsFired = [];
        callbacksFired = [];

        const realAPI : ApiCallFunction = (parameters: any, cb: (err: any, resp: any)=>void) => {
            request(parameters, cb);
        };

        const vault = new Vault(salts, realAPI);

        vault.auth('http://localhost:8080/', 'lbarman', 'passwd', errorCb);


    });*/

    it('can create a Vault with a mock API, which interacts with a fake server', () => {
        apiCallsFired = [];
        callbacksFired = [];

        const vault = new Vault(mockAPI);
        vault.auth('url', 'username', 'passwd', errorCb);

        apiCallsFired[0].cb(null, { body: JSON.stringify(config)});

        expect(apiCallsFired.length).toBe(2); // one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({
            url: 'url/config'
        });
        expect(apiCallsFired[1].parameters).toEqual({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        });

        let apiAnswerFn = apiCallsFired[1].cb;
        apiCallsFired = [];
        callbacksFired = [];

        // server reachable and empty remote cipher
        apiAnswerFn(null, {
            body: '{"error":false,"description":"","data":""}'
        });

        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1); // returns the new vault
        expect(callbacksFired[0].err).toBe(null);

        apiCallsFired = [];
        callbacksFired = [];

        expect(vault.isAuth()).toBe(true);
        expect(vault.getAllEntries().length).toBe(0);

        // add one entry
        vault.addEntry({
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        });

        expect(vault.getAllEntries().length).toBe(1);
        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(0);

        // save the current vault
        vault.save(errorCb);

        expect(apiCallsFired.length).toBe(1); // one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters.method).toEqual('POST');
        expect(apiCallsFired[0].parameters.url).toEqual(
                'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api');
        expect(apiCallsFired[0].parameters.headers).toEqual({'Content-Type': 'application/json'});
        const dataSent = apiCallsFired[0].parameters.body;

        // parses the url data=X&last_hash=Y
        const dataSentMap = JSON.parse(dataSent);

        expect('new_password' in dataSentMap).toBeTruthy();
        expect('new_data' in dataSentMap).toBeTruthy();
        expect('old_hash' in dataSentMap).toBeTruthy();
        expect('new_hash' in dataSentMap).toBeTruthy();
        apiCallsFired = [];
        callbacksFired = [];

        // suppose the server accepted this message, const's create a new vault with some fixed data data

        const vault3 = new Vault(mockAPI);
        vault3.auth('url', 'ninja', 'passwd', errorCb);

        apiCallsFired[0].cb(null, { body: JSON.stringify(config)});

        expect(apiCallsFired.length).toBe(2);
        expect(callbacksFired.length).toBe(0);

        apiAnswerFn = apiCallsFired[1].cb;
        apiCallsFired = [];
        callbacksFired = [];

        // encrypted with master password 'passwd'. DB contains a single object Object:
        // {id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr',
        // created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
        // tslint:disable-next-line:max-line-length
        const bodyStr = '{"error":false,"description":"","data":"{\\"iv\\":\\"32CPCDg5TZfwMxTAkoxNnA==\\",\\"v\\":1,\\"iter\\":10000,;\\"ks\\";:128,;\\"ts\\";:64,;\\"mode\\";:\\"ccm\\",;\\"adata\\";:\\"\\",;\\"cipher\\";:\\"aes\\",;\\"salt\\";:\\"2xgYuLeaI70=\\",;\\"ct\\";:\\"VP8hRnz0h71X0AycacRmDZVy6eCjglxTMGm\/MgFxDv3YiaSHMaIxfX2Krx6IDmHZGs1KLCmZWpgqW+NxUAdo6iIhTE7yQ2+JPY4iyvtEdvCJpMY9hGPxLACFC7i7JWLkNOSgeIOj9lO5SJBVtE5DASXfW68GZjTM0rc6PevuWQyAwwTwlnoLxQivodU0hH0w6LeUDXbpPtZGbP2vmiNuFs9haj1VRhrnHFUwRUTY\\/mSE1JtClMvhjwjyfTYQdXjGA2qr9XBMiQWNFkA=\\";}"}';
        apiAnswerFn(null, {body: bodyStr});

        expect(vault3.getAllEntries().length).toBe(1);
        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1);
        apiCallsFired = [];
        callbacksFired = [];

        const entry = vault3.getEntry('0');
        expect(entry.title).toEqual('Hello');
        expect(entry.url).toEqual('http://example.com');
        expect(entry.login).toEqual('Bob');
        expect(entry.password).toEqual('zephyr');

        // once unlogged, should not be able to add any entry

        vault3.unauth();
        expect(vault3.addEntry.bind(entry)).toThrow();
        expect(vault3.updateEntry.bind(entry)).toThrow();
        expect(vault3.removeEntry.bind(entry)).toThrow();
        expect(vault3.findEntries.bind('')).toThrow();
        expect(vault3.getAllEntries).toThrow();
        expect(vault3.getEntry.bind(0)).toThrow();
    });

    it('can create a Vault with a mock API, and play with entries', () => {
        apiCallsFired = [];
        callbacksFired = [];

        const vault = new Vault(mockAPI);
        vault.auth('url', 'username', 'passwd', errorCb);

        apiCallsFired[0].cb(null, { body: JSON.stringify(config)});

        expect(apiCallsFired.length).toBe(2); // one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({
            url: 'url/config'
        });
        expect(apiCallsFired[1].parameters).toEqual({
            url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'
        });

        const apiAnswerFn = apiCallsFired[1].cb;
        apiCallsFired = [];
        callbacksFired = [];

        // server reachable and empty remote cipher
        apiAnswerFn(null, { body: '{"error":false,"description":"","data":""}' });

        apiCallsFired = [];
        callbacksFired = [];

        // add one entry
        vault.addEntry({
            title: 'github',
            login: 'json',
            password: 'zephyr',
            url: 'http://github.com'
        });

        expect(vault.getAllEntries().length).toBe(1);
        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(0);

        // add one entry
        vault.addEntry({
            title: 'gitlab',
            login: 'jasongit',
            password: 'jackson',
            url: 'http://lab.git.com'
        });

        expect(vault.getAllEntries().length).toBe(2);
        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(0);

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
