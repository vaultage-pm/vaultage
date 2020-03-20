import { Crypto as CryptoNode } from 'src/crypto/Crypto.node';
import { Crypto as CryptoSJCL } from 'src/crypto/Crypto.sjcl';
import { ICrypto } from 'src/crypto/ICrypto';
import { ISaltsConfig } from 'src/public-api';

function generateString(len: number) {
    return Math.random().toString(36).substr(2, 2 + len);
}

const testCryptoSuite = (ctr: new(salts: ISaltsConfig) => ICrypto) => () => {
    let crypto: ICrypto;

    beforeEach(() => {
        crypto = new ctr({
            LOCAL_KEY_SALT: 'deadbeef',
            REMOTE_KEY_SALT: '0123456789',
        });
    });

    describe('the key derivation function', () => {
        const masterKey = 'ucantseeme';
        it('gives a consistent local key', async () => {
            const localKey = await crypto.deriveLocalKey(masterKey);
            expect(localKey).toEqual('f99abd482e3b4874fcb86cb735facd41eabbfc8f777bee4c33f0064c45b07af5');
        });
        it('gives a consistent remote key', async () => {
            const remoteKey = await crypto.deriveRemoteKey(masterKey);
            expect(remoteKey).toEqual('e76a6906c85e8bef9eaf7ee4984113d0ec20431668c5faf0a232e0afeceaa62e');
        });
    });

    describe('the encryption/decryption pair', () => {
        const key = 'ucantseeme';
        // tslint:disable:max-line-length
        const lorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid ad fugit magnam doloribus quaerat earum odit dolorem sit! Maxime voluptas ratione itaque consequatur dolorum, tempora magni quae accusantium nihil facere.';
        const loremCipher = {
            iv: 'tXbr392E0EGY5OOReoaNqg==',
            v: 1,
            iter: 10000,
            ks: 128,
            ts: 64,
            mode: 'ccm',
            adata: '',
            cipher: 'aes',
            salt: 'OSVTas5/DOc=',
            ct: 'LazALQiYn7Wb2vOQZOl8tbva7ph04I9Sr3w+lHOnLePudus6PYHNwrKLTcAL58eerWNdc8JfNb1N0gzJF5jxPZikIHdCnhL51swEpp43vOKND4pTVSETrKs2Au8P3u/HdM0XK+qlXUjhMvRC3Iu3j0PIhKLk2eTOUgMq38l8XFF1iyXkTgVq+7pHniplE9Y9LyT7DoHtMeallmMM43JiRXtvynXituFdA4alz+7WuazatNUYaZdCARJhpgblgQVeX28Xb9M/BQD9gM9O/oP/TYdmXa2Fw/ltqRF3+DVyTiN/3D4='
        };
        // tslint:enable:max-line-length

        it('works together', async () => {
            const cipher = await crypto.encrypt(key, lorem);
            const cleartext = await crypto.decrypt(key, cipher);
            expect(cleartext).toEqual(lorem);
        });

        it('decodes a well known cipher', async () => {
            const cleartext = await crypto.decrypt(key, JSON.stringify(loremCipher));
            expect(cleartext).toEqual(lorem);
        });

        // note: we can't test the encryption against a well known cipher because the iv is random
    });

    describe('the key derivation works with encryption and decryption', () => {
        it('work together', async () => {
            const masterKey = generateString(20);
            const localKey = await crypto.deriveLocalKey(masterKey);
            const plaintext = generateString(2000);
            const cipher = await crypto.encrypt(localKey, plaintext);
            const decoded = await crypto.decrypt(localKey, cipher);
            expect(plaintext).toEqual(decoded);
        });
    });

    describe('the fingerprint function', () => {
        it('returns the expected fingerprint', async () => {
            const fingerprint1 = await crypto.getFingerprint('His name is John, Cenaaaa!', 'ucantseeme');
            expect(fingerprint1).toEqual('30898dbd7c426c0a496c570aaa2e620dbcc08d9558a81313e4d90829782098cf');
            const fingerprint2 = await crypto.getFingerprint('One does not simply _ Assume a fingerprint function.', 'SeanBean');
            expect(fingerprint2).toEqual('f0629d10705d939ea2869b94aee1f199d2ca9820942d9b19e984693cb76d94d3');
        });
    });
};

describe('Crypto.node', testCryptoSuite(CryptoNode));
describe('Crypto.sjcl', testCryptoSuite(CryptoSJCL));

describe('Interoperability', () => {

    // tslint:disable-next-line:max-line-length
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid ad fugit magnam doloribus quaerat earum odit dolorem sit! Maxime voluptas ratione itaque consequatur dolorum, tempora magni quae accusantium nihil facere.';
    const greekLorem = 'Γαζέες καὶ μυρτιὲς δὲν θὰ βρῶ πιὰ στὸ χρυσαφὶ ξέφωτο';
    const key = 'aleajactaest';

    let cryptoNode: ICrypto;
    let cryptoSJCL: ICrypto;

    beforeEach(() => {
        cryptoNode = new CryptoNode({
            LOCAL_KEY_SALT: 'deadbeef',
            REMOTE_KEY_SALT: '0123456789',
        });
        cryptoSJCL = new CryptoSJCL({
            LOCAL_KEY_SALT: 'deadbeef',
            REMOTE_KEY_SALT: '0123456789',
        });
    });

    describe('Crypto.node -> Crypto.sjcl', () => {
        test('Works with regular data', async () => {
            const cipher = await cryptoNode.encrypt(key, lorem);
            const cleartext = await cryptoSJCL.decrypt(key, cipher);
            expect(cleartext).toEqual(lorem);
        });

        test('Works with special character encoding', async () => {
            const cipher = await cryptoNode.encrypt(key, greekLorem);
            const cleartext = await cryptoSJCL.decrypt(key, cipher);
            expect(cleartext).toEqual(greekLorem);
        });
    });

    describe('Crypto.sjcl -> Crypto.node', () => {
        test('Works with regular data', async () => {
            const cipher = await cryptoSJCL.encrypt(key, lorem);
            const cleartext = await cryptoNode.decrypt(key, cipher);
            expect(cleartext).toEqual(lorem);
        });

        test('Works with special character encoding', async () => {
            const cipher = await cryptoSJCL.encrypt(key, greekLorem);
            const cleartext = await cryptoNode.decrypt(key, cipher);
            expect(cleartext).toEqual(greekLorem);
        });
    });
});
