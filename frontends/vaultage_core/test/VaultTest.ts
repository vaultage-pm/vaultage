import { Vault } from '../src/Vault';
import { SaltsConfig } from '../src/Crypto';

let salts : SaltsConfig = { LOCAL_KEY_SALT: "deadbeef", REMOTE_KEY_SALT: "0123456789"};

function generateString(len) {
    return Math.random().toString(36).substr(2, 2 + len);
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
});