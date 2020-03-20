import { anyString, instance, mock, when } from 'omnimock';

import { CryptoService } from '../src/crypto/crypto-service';
import { PasswordStrength } from '../src/interface';
import { VaultDB } from '../src/vault/VaultDB';
import { PasswordsService } from './passwords/passwords-service';
import { VaultDBService } from './vault/vaultdb-service';

const verbose = false;

function cPrint(v: any) {
    if (verbose) {
        console.log(v);
    }
}

test('Workflow', async () => {

    cPrint('Demoing the encryption / decryption locally...');
    cPrint('Note that this is demoing the inside of the vaultage SDK but all of this complexity' +
        ' is going to be hidden behind the Vault class.\n');

    const mockPasswordsService = mock(PasswordsService);
    when(mockPasswordsService.getPasswordStrength(anyString())).return(1);

    const crypto = new CryptoService().getCrypto({
        LOCAL_KEY_SALT: 'abcdef',
        REMOTE_KEY_SALT: '01234576',
    });
    const vaultDBService = new VaultDBService(instance(mockPasswordsService));

    const masterKey = 'ilovesushi';

    const key = await crypto.deriveLocalKey(masterKey);
    cPrint('My local key is: ' + key + '\n');

    // tslint:disable-next-line:object-literal-key-quotes
    const db = new VaultDB(instance(mockPasswordsService), {'0': {
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
    const plain = vaultDBService.serialize(db);
    const fp = await crypto.getFingerprint(plain, key);

    cPrint('Here is what the db looks like initially: ');
    cPrint(db);
    cPrint('Fingerprint: ' + fp);

    cPrint('\n\nNow I\'m gonna encrypt the db');
    const enc = await crypto.encrypt(key, plain);

    cPrint('Here is the cipher:\n');
    cPrint(enc);

    cPrint('\n\nAnd now let\'s get back the original:');

    const dec = await crypto.decrypt(key, enc);
    const decFP = await crypto.getFingerprint(dec, key);
    const decDB = vaultDBService.deserialize(dec);

    cPrint(decDB);
    cPrint('Fingerprint: ' + decFP);

    expect(fp).toEqual(decFP);
    expect(plain).toEqual(dec);
});

