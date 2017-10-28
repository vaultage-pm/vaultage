import { Crypto } from '../src/Crypto';

function generateString(len) {
    return Math.random().toString(36).substr(2, 2 + len);
}

describe('Crypto.ts', () => {
    let crypto: Crypto;

    beforeEach(() => {
        crypto = new Crypto({
            LOCAL_KEY_SALT: "deadbeef",
            REMOTE_KEY_SALT: "0123456789",
        });
    });

    describe('the key derivation function', () => {
        let masterKey = "ucantseeme"
        it('gives a consistent local key', () => {
            let localKey = crypto.deriveLocalKey(masterKey);
            expect(localKey).toEqual("f99abd482e3b4874fcb86cb735facd41eabbfc8f777bee4c33f0064c45b07af5");
        });
        it('gives a consistent remote key', () => {
            let remoteKey = crypto.deriveRemoteKey(masterKey);
            expect(remoteKey).toEqual("e76a6906c85e8bef9eaf7ee4984113d0ec20431668c5faf0a232e0afeceaa62e");
        });
    })

    describe('the encryption/decryption pair', () => {
        for(let i=0; i<10; i++){
            let localKey = generateString(20);
            let plaintext = generateString(2000);

            it('work together', () => {
                let cipher = crypto.encrypt(localKey, plaintext);
                let decoded = crypto.decrypt(localKey, cipher);
                expect(plaintext).toEqual(plaintext);
            });

            it('is not the identity function', () => {
                let cipher = crypto.encrypt(localKey, plaintext);
                expect(plaintext).not.toEqual(cipher);
            });
        }
    })

    describe('the key derivation works with encryption and decryption', () => {
         for(let i=0; i<10; i++){
            it('work together', () => {
                let masterKey = generateString(20);
                let localKey = crypto.deriveLocalKey(masterKey);
                let plaintext = generateString(2000);
                let cipher = crypto.encrypt(localKey, plaintext);
                let decoded = crypto.decrypt(localKey, cipher);
                expect(plaintext).toEqual(plaintext);
            });
        }
    })

    describe('the fingerprint function', () => {
        for(let i=0; i<10; i++){
            let database = generateString(2000);
            let masterKey = generateString(20);
            it('works on a random database', () => {
                let localKey = crypto.deriveLocalKey(masterKey);
                let fingerprint = crypto.getFingerprint(localKey, database);
                expect(fingerprint).not.toEqual(database);
            });
            it('is deterministic', () => {
                let localKey = crypto.deriveLocalKey(masterKey);
                let fingerprint = crypto.getFingerprint(localKey, database);
                let fingerprint2 = crypto.getFingerprint(localKey, database);
                expect(fingerprint).toEqual(fingerprint2);
            });
            it('depends on the local key', () => {
                let localKey = crypto.deriveLocalKey(masterKey);
                let localKey2 = crypto.deriveLocalKey(masterKey+"2");
                let fingerprint = crypto.getFingerprint(localKey, database);
                let fingerprint2 = crypto.getFingerprint(localKey2, database);
                expect(fingerprint).not.toEqual(fingerprint2);
            });
        }
    })
});
