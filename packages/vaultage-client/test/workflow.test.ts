import { Crypto } from '../src/Crypto';
import { PasswordStrength } from '../src/Passwords';
import { VaultDB } from '../src/VaultDB';

test('Workflow', () => {

    console.log('Demoing the encryption / decryption locally...');
    console.log('Note that this is demoing the inside of the vaultage SDK but all of this complexity' +
        ' is going to be hidden behind the Vault class.\n');

    const crypto = new Crypto({
        LOCAL_KEY_SALT: 'abcdef',
        REMOTE_KEY_SALT: '01234576',
    });

    const masterKey = 'ilovesushi';

    const key = crypto.deriveLocalKey(masterKey);
    console.log('My local key is: ' + key + '\n');

    // tslint:disable-next-line:object-literal-key-quotes
    const db = new VaultDB({'0': {
            title: 'Hello',
            id: '0',
            created: 'now',
            updated: '',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com',
            usage_count: 0,
            reuse_count: 0,
            password_strength_indication: PasswordStrength.WEAK,
            hidden: false,
        }
    });
    const plain = VaultDB.serialize(db);
    const fp = crypto.getFingerprint(plain, key);

    console.log('Here is what the db looks like initially: ');
    console.log(db);
    console.log('Fingerprint: ' + fp);

    console.log('\n\nNow I\'m gonna encrypt the db');
    const enc = crypto.encrypt(key, plain);

    console.log('Here is the cipher:\n');
    console.log(enc);

    console.log('\n\nAnd now let\'s get back the original:');

    const dec = crypto.decrypt(key, enc);
    const decFP = crypto.getFingerprint(dec, key);
    const decDB = VaultDB.deserialize(dec);

    console.log(decDB);
    console.log('Fingerprint: ' + decFP);

    expect(fp).toEqual(decFP);
    expect(plain).toEqual(dec);
});

