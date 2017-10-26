import { Crypto } from '../src/Crypto';

describe('The Crypto class', () => {
    let crypto: Crypto;

    beforeEach(() => {
        crypto = new Crypto({
            USERNAME_SALT: "deadbeef"
        });
    });

    describe('the key derivation function', () => {
        it('Gives a consistent local key', () => {
            let localKey = crypto.deriveLocalKey("John Cena", "ucantseeme");
            expect(localKey).toEqual("819c5b807446a9391dd2f3e666f882f4eeb6d85cbde169b8911dce8477e91e77");
        });
        it('Gives a consistent remote key', () => {
            let remoteKey = crypto.deriveRemoteKey("John Cena", "ucantseeme");
            expect(remoteKey).toEqual("405f10dca1a9ac76aa90f28ba66482c9416f2bd7fed9014c6f95119890340427");
        });
    })
});
