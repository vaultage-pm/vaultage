import { Vault, ApiCallFunction } from '../src/Vault';
import { VaultageError, ERROR_CODE } from '../src/VaultageError';
import { SaltsConfig } from '../src/Crypto';


let salts : SaltsConfig = { LOCAL_KEY_SALT: "deadbeef", REMOTE_KEY_SALT: "0123456789"};

let apiCallsFired: any[] = [];
let mockAPI : ApiCallFunction = (parameters: any, cb: (err: any, resp: any)=>void) => {
    apiCallsFired.push({'parameters': parameters, 'cb': cb});
    
};

let callbacksFired : any[] = [];
let errorCb = (err: VaultageError) => {
    callbacksFired.push({'err': err});
}

describe('Vault.ts can', () => {
    it('create an empty vault', () => {
        let vault = new Vault(salts);
        expect(vault).toEqual(vault);
    });
    it('cannot login without credentials', () => {
        let vault = new Vault(salts);
        expect(vault).toEqual(vault);
    });

    it('can create a Vault with a mock API, which detects an unreachable remote', () => {
        apiCallsFired = [];
        callbacksFired = [];

        let vault = new Vault(salts, mockAPI);
        vault.auth("url", "username", "passwd", errorCb);

        expect(apiCallsFired.length).toBe(1); //one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'});

        let apiAnswerFn = apiCallsFired[0].cb
        apiCallsFired = [];
        callbacksFired = [];

        //bad luck, server unreachable
        apiAnswerFn("404 error", null);

        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1); //Vault got a 404 internally, should throws an error
        expect(callbacksFired[0].err.code).toEqual(ERROR_CODE.NETWORK_ERROR);
    });

    it('can create a Vault with a mock API, which detects a login error', () => {
        apiCallsFired = [];
        callbacksFired = [];

        let vault = new Vault(salts, mockAPI);
        vault.auth("url", "username", "passwd", errorCb);

        expect(apiCallsFired.length).toBe(1); //one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'});

        let apiAnswerFn = apiCallsFired[0].cb
        apiCallsFired = [];
        callbacksFired = [];
        
        //bad luck, server reachable but wrong credentials
        apiAnswerFn(null, {body:'{"error":true,"description":"Error, authentication failed."}'});

        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1); //Vault got a 200 OK (but auth failed) internally, should throws an error
        expect(callbacksFired[0].err.code).toEqual(ERROR_CODE.BAD_REMOTE_CREDS);
    });

    /*

    it('can create a Vault with a mock API, which interacts with a server', () => {
        apiCallsFired = [];
        callbacksFired = [];

        let realAPI : ApiCallFunction = (parameters: any, cb: (err: any, resp: any)=>void) => {
            request(parameters, cb);
        };

        let vault = new Vault(salts, realAPI);

        vault.auth("http://localhost:8080/", "lbarman", "passwd", errorCb);
        
        
    });*/

    it('can create a Vault with a mock API, which interacts with a fake server', () => {
        apiCallsFired = [];
        callbacksFired = [];

        let vault = new Vault(salts, mockAPI);
        vault.auth("url", "username", "passwd", errorCb);

        expect(apiCallsFired.length).toBe(1); //one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'});

        let apiAnswerFn = apiCallsFired[0].cb
        apiCallsFired = [];
        callbacksFired = [];

        //server reachable and empty remote cipher
        apiAnswerFn(null, {body:'{"error":false,"description":"","data":""}'});

        expect(apiCallsFired.length).toBe(0);
        expect(callbacksFired.length).toBe(1); // returns the new vault
        expect(callbacksFired[0].err).toBe(null);
        
        apiCallsFired = [];
        callbacksFired = [];

        expect(vault.isAuth()).toBe(true)
        expect(vault.getAllEntries().length).toBe(0)

        //add one entry
        vault.addEntry({
            title: "Hello",
            login: "Bob",
            password: "zephyr",
            url: "http://example.com"
        })

        expect(vault.getAllEntries().length).toBe(1)
        expect(apiCallsFired.length).toBe(0)
        expect(callbacksFired.length).toBe(0);

        //save the current vault
        vault.save(errorCb)

        expect(apiCallsFired.length).toBe(1) //one request to the server
        expect(callbacksFired.length).toBe(0)
        expect(apiCallsFired[0].parameters.method).toEqual('POST')    
        expect(apiCallsFired[0].parameters.url).toEqual('url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api')
        expect(apiCallsFired[0].parameters.headers).toEqual({'Content-Type': 'application/x-www-form-urlencoded'})
        let dataSent = apiCallsFired[0].parameters.body

        // parses the url data=X&last_hash=Y
        let dataSentArray = dataSent.split('&').map((elem) => elem.split('='))
        let dataSentMap = dataSentArray.reduce((accu, val) => {accu[val[0]] = val[1]; return accu},{})

        expect('new_data' in dataSentMap).toBeTruthy();
        expect('old_hash' in dataSentMap).toBeTruthy();
        expect('new_hash' in dataSentMap).toBeTruthy();
        apiCallsFired = [];
        callbacksFired = [];

        //suppose the server accepted this message, let's create a new vault with some fixed data data

        let vault3 = new Vault(salts, mockAPI);
        vault3.auth("url", "ninja", "passwd", errorCb);

        expect(apiCallsFired.length).toBe(1)
        expect(callbacksFired.length).toBe(0);

        apiAnswerFn = apiCallsFired[0].cb
        apiCallsFired = [];
        callbacksFired = [];

        // encrypted with master password "passwd". DB contains a single object Object{id: 0, title: 'Hello', url: 'http://example.com', login: 'Bob', password: 'zephyr', created: 'Sat, 28 Oct 2017 12:41:50 GMT', updated: 'Sat, 28 Oct 2017 12:41:50 GMT'}
        let bodyStr = '{"error":false,"description":"","data":"{\\"iv\\":\\"32CPCDg5TZfwMxTAkoxNnA==\\",\\"v\\":1,\\"iter\\":10000,\\"ks\\":128,\\"ts\\":64,\\"mode\\":\\"ccm\\",\\"adata\\":\\"\\",\\"cipher\\":\\"aes\\",\\"salt\\":\\"2xgYuLeaI70=\\",\\"ct\\":\\"VP8hRnz0h71X0AycacRmDZVy6eCjglxTMGm\/MgFxDv3YiaSHMaIxfX2Krx6IDmHZGs1KLCmZWpgqW+NxUAdo6iIhTE7yQ2+JPY4iyvtEdvCJpMY9hGPxLACFC7i7JWLkNOSgeIOj9lO5SJBVtE5DASXfW68GZjTM0rc6PevuWQyAwwTwlnoLxQivodU0hH0w6LeUDXbpPtZGbP2vmiNuFs9haj1VRhrnHFUwRUTY\\/mSE1JtClMvhjwjyfTYQdXjGA2qr9XBMiQWNFkA=\\"}"}';
        apiAnswerFn(null, {body:bodyStr});

        expect(vault3.getAllEntries().length).toBe(1)
        expect(apiCallsFired.length).toBe(0)
        expect(callbacksFired.length).toBe(1);
        apiCallsFired = [];
        callbacksFired = [];

        let entry = vault3.getEntry("0");
        expect(entry.title).toEqual("Hello");
        expect(entry.url).toEqual("http://example.com");
        expect(entry.login).toEqual("Bob");
        expect(entry.password).toEqual("zephyr");

        //once unlogged, should not be able to add any entry

        vault3.unauth();
        expect(vault3.addEntry.bind(entry)).toThrow()
        expect(vault3.updateEntry.bind(entry)).toThrow()
        expect(vault3.removeEntry.bind(entry)).toThrow()
        expect(vault3.findEntries.bind('')).toThrow()
        expect(vault3.getAllEntries).toThrow()
        expect(vault3.getEntry.bind(0)).toThrow()

    });



    it('can create a Vault with a mock API, and play with entries', () => {
        apiCallsFired = [];
        callbacksFired = [];

        let vault = new Vault(salts, mockAPI);
        vault.auth("url", "username", "passwd", errorCb);

        expect(apiCallsFired.length).toBe(1); //one request to the server
        expect(callbacksFired.length).toBe(0);
        expect(apiCallsFired[0].parameters).toEqual({url: 'url/username/483c29af947d335ed2851c62f1daa12227126b00035387f66f2d1492036d4dcb/vaultage_api'});

        let apiAnswerFn = apiCallsFired[0].cb
        apiCallsFired = [];
        callbacksFired = [];

        //server reachable and empty remote cipher
        apiAnswerFn(null, {body:'{"error":false,"description":"","data":""}'});

        apiCallsFired = [];
        callbacksFired = [];

        //add one entry
        vault.addEntry({
            title: "github",
            login: "json",
            password: "zephyr",
            url: "http://github.com"
        })

        expect(vault.getAllEntries().length).toBe(1)
        expect(apiCallsFired.length).toBe(0)
        expect(callbacksFired.length).toBe(0);

        //add one entry
        vault.addEntry({
            title: "gitlab",
            login: "jason",
            password: "jackson",
            url: "http://lab.git.com"
        })

        expect(vault.getAllEntries().length).toBe(2)
        expect(apiCallsFired.length).toBe(0)
        expect(callbacksFired.length).toBe(0);

        vault.updateEntry("0", {
            password: "aceventura",
        });

        console.log(vault.getAllEntries())
    });
});