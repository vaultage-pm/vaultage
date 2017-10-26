import { Crypto } from '../src/Crypto';

describe('The Crypto class', () => {
    let crypto: Crypto;

    beforeEach(() => {
        crypto = new Crypto({
            LOCAL_KEY_SALT: "deadbeef",
            REMOTE_KEY_SALT: "0123456789",
        });
    });

    describe('the key derivation function', () => {
        let masterKey = "ucantseeme"
        it('Gives a consistent local key', () => {
            let localKey = crypto.deriveLocalKey(masterKey);
            expect(localKey).toEqual("f99abd482e3b4874fcb86cb735facd41eabbfc8f777bee4c33f0064c45b07af5");
        });
        it('Gives a consistent remote key', () => {
            let remoteKey = crypto.deriveRemoteKey(masterKey);
            expect(remoteKey).toEqual("e76a6906c85e8bef9eaf7ee4984113d0ec20431668c5faf0a232e0afeceaa62e");
        });
    })
});
