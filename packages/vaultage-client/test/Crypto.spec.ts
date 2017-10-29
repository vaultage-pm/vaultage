import { config } from '../src/Vault';
import { Crypto } from '../src/Crypto';

describe('The Crypto class', () => {
    let crypto: Crypto;

    beforeEach(() => {
        crypto = new Crypto(config, {
            USERNAME_SALT: "deadbeef"
        });
    });

    describe('the key derivation function', () => {
        it('yields a consistent local key', () => {
            let localKey = crypto.deriveLocalKey("John Cena", "ucantseeme");
            expect(localKey).toEqual("819c5b807446a9391dd2f3e666f882f4eeb6d85cbde169b8911dce8477e91e77");
        });
        it('yields a consistent remote key', () => {
            let remoteKey = crypto.deriveRemoteKey("John Cena", "ucantseeme");
            expect(remoteKey).toEqual("405f10dca1a9ac76aa90f28ba66482c9416f2bd7fed9014c6f95119890340427");
        });
    });

    describe('the symmetric encryption', () => {
        it('is encrypted with appropriate parameters', () => {
            let key = "foobar92";
            let cipher = JSON.parse(crypto.encrypt(key, "Hello world"));
            expect(cipher.iter).toEqual(10000);
            expect(cipher.ks).toEqual(128); // Key size
            expect(cipher.ts).toEqual(64); // Tag size
            expect(cipher.mode).toEqual('ccm');
            expect(cipher.cipher).toEqual('aes');
        });
        it('deciphers to the correct plaintext', () => {
            let key = "foobar92";
            expect(crypto.decrypt(key, '{"iv":"qEhYAa8gwofhYdO+BQjMyg==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"JYP1o0xg5i0=","ct":"gtY91MKy5KLPePwJk0UsXJs9Kw=="}'))
                .toEqual("Hello world");
        });
    });

    describe('fingerprint', () => {
        it('yields the expected fingerprint', () => {
            expect(crypto.getFingerprint('Lucy in the Sky with Diamonds', 'castle bravo'))
                .toEqual('a24e4c5555d4e9066db9d6178433bd080b338297ee91fe8f8a7fb129dc251a31');
        });
    });
});
