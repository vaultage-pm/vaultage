import { Crypto } from '../src/Crypto';

function generateString(len: number) {
    return Math.random().toString(36).substr(2, 2 + len);
}

describe('Crypto.ts', () => {
    let crypto: Crypto;

    beforeEach(() => {
        crypto = new Crypto({
            LOCAL_KEY_SALT: 'deadbeef',
            REMOTE_KEY_SALT: '0123456789',
        });
        crypto.PBKDF2_DIFFICULTY = 1;
    });

    describe('  ', () => {
        const masterKey = 'ucantseeme';
        it('gives a consistent local key', () => {
            const localKey = crypto.deriveLocalKey(masterKey);
            expect(localKey).toEqual('93ff3db4b46bf6e63885f0d37efcac689970947c49cd9a04e66cace32b258b0e');
        });
        it('gives a consistent remote key', () => {
            const remoteKey = crypto.deriveRemoteKey(masterKey);
            expect(remoteKey).toEqual('8aefc63391ce6eb2e706bf92d0af026189adfe02d2bc757ca5511112c8bdb2a8');
        });
    });

    describe('the encryption/decryption pair', () => {
        for (let i = 0 ; i < 10 ; i++) {
            const localKey = generateString(20);
            const plaintext = generateString(2000);

            it('work together', async () => {
                const cipher = await crypto.encrypt(localKey, plaintext);
                const decoded = await crypto.decrypt(localKey, cipher);
                expect(plaintext).toEqual(decoded);
            });

            it('is not the identity function', () => {
                const cipher = crypto.encrypt(localKey, plaintext);
                expect(plaintext).not.toEqual(cipher);
            });
        }
    });

    describe('the key derivation works with encryption and decryption', () => {
         for (let i = 0 ; i < 10 ; i++) {
            it('work together', async () => {
                const masterKey = generateString(20);
                const localKey = crypto.deriveLocalKey(masterKey);
                const plaintext = generateString(2000);
                const cipher = await crypto.encrypt(localKey, plaintext);
                const decoded = await crypto.decrypt(localKey, cipher);
                expect(plaintext).toEqual(decoded);
            });
        }
    });

    describe('the fingerprint function', () => {
        for (let i = 0 ; i < 10 ; i++) {
            const database = generateString(2000);
            const masterKey = generateString(20);
            it('works on a random database', () => {
                const localKey = crypto.deriveLocalKey(masterKey);
                const fingerprint = crypto.getFingerprint(localKey, database);
                expect(fingerprint).not.toEqual(database);
            });
            it('is deterministic', () => {
                const localKey = crypto.deriveLocalKey(masterKey);
                const fingerprint = crypto.getFingerprint(localKey, database);
                const fingerprint2 = crypto.getFingerprint(localKey, database);
                expect(fingerprint).toEqual(fingerprint2);
            });
            it('depends on the local key', () => {
                const localKey = crypto.deriveLocalKey(masterKey);
                const localKey2 = crypto.deriveLocalKey(masterKey + '2');
                const fingerprint = crypto.getFingerprint(localKey, database);
                const fingerprint2 = crypto.getFingerprint(localKey2, database);
                expect(fingerprint).not.toEqual(fingerprint2);
            });
        }
    });
});
