import * as util from 'util';
import * as vaultage from '../src/vaultage';

import { IVaultDBEntryAttrs, Vault } from '../src/vaultage';

async function runIntegrationTest() {
    const serverUrl = 'http://localhost:3000/';
    const username = 'john';
    const masterpwd = '1234';

    // create vault
    let vault = await vaultage.login(serverUrl, username, masterpwd);

    if (vault.getNbEntries() !== 0) {
        throw new Error('This integration test is meant to be run on a clean computer. Your DB is not empty. Aborting.');
    }

    console.log('Authentication and pull OK ! Creating entry...');

    // adds an entry
    const newEntry: IVaultDBEntryAttrs = {
        title: 'MyTitle',
        login: 'Username',
        password: 'Password',
        url: 'http://url'
    };

    vault.addEntry(newEntry);

    console.log('Pushing the db...');

    await vault.save();

    // log out and pull again
    console.log('Logging back in...');

    vault = await vaultage.login(serverUrl, username, masterpwd);

    if (vault.getNbEntries() !== 1) {
        fail(vault, 'Could not get back the entry we just created.');
    }

    const e = vault.getEntry('0');

    if (e.title !== newEntry.title) {
        fail(vault, 'The fetched entry has a different title than the created entry.');
    }
    if (e.login !== newEntry.login) {
        fail(vault, 'The fetched entry has a different login than the created entry.');
    }
    if (e.password !== newEntry.password) {
        fail(vault, 'The fetched entry has a different password than the created entry.');
    }
    if (e.url !== newEntry.url) {
        fail(vault, 'The fetched entry has a different url than the created entry.');
    }

    console.log('Entry correctly fetched ! Trying to edit it...');

    // edit our entry
    const newEntry2: IVaultDBEntryAttrs = {
        title: 'MyTitle2',
        login: 'Username2',
        password: 'Password2',
        url: 'http://url2'
    };

    vault.updateEntry('0', newEntry2);

    console.log('Saving it...');

    // manually save
    await vault.save();

    console.log('Manually pulling the db...');

    // try to manually pull the db
    await vault.pull();

    if (vault.getNbEntries() !== 1) {
        fail(vault, 'Could not get back the entry we just edited.');
    }

    const e2 = vault.getEntry('0');

    if (e2.title !== newEntry2.title) {
        fail(vault, 'The fetched entry has a different title than the created entry.');
    }
    if (e2.login !== newEntry2.login) {
        fail(vault, 'The fetched entry has a different login than the created entry.');
    }
    if (e2.password !== newEntry2.password) {
        fail(vault, 'The fetched entry has a different password than the created entry.');
    }
    if (e2.url !== newEntry2.url) {
        fail(vault, 'The fetched entry has a different url than the created entry.');
    }

    console.log('Entry correctly edited ! Now trying to change the master password...');

    const newMasterPassword = 'masterpwd2';

    await vault.updateMasterPassword(newMasterPassword);

    // log out and pull again
    console.log('Logging out...');

    vault = await vaultage.login(serverUrl, username, newMasterPassword);

    // check if the vault content is as expected

    if (vault.getNbEntries() !== 1) {
        fail(vault, 'Could not get back the entry.');
    }

    const e3 = vault.getEntry('0');

    if (e3.title !== newEntry2.title) {
        fail(vault, 'The fetched entry has a different title than the created entry.');
    }
    if (e3.login !== newEntry2.login) {
        fail(vault, 'The fetched entry has a different login than the created entry.');
    }
    if (e3.password !== newEntry2.password) {
        fail(vault, 'The fetched entry has a different password than the created entry.');
    }
    if (e3.url !== newEntry2.url) {
        fail(vault, 'The fetched entry has a different url than the created entry.');
    }

    console.log('Trying to delete the entry...');

    vault.removeEntry('0');

    if (vault.getNbEntries() !== 0) {
        fail(vault, 'Could not delete the entry.');
    }

    console.log('Everything went well ! Test OK.');
}

runIntegrationTest().catch((e) => {
    if (e.message === 'Error: Invalid credentials') {
        console.log('Error: Invalid credentials. This integration test is meant to be ' +
        'run against an *empty* db - please (backup and) delete ~/.vaultage and retry.');
        process.exit(1);
    }
    console.log('Error:', e);
    process.exit(1);
});


function fail(vault: Vault, reason: string) {
    console.log(`=== FAILURE: ${reason} ===`);
    console.log('Dumping vault state:');
    console.log(util.inspect(vault, { showHidden: false, depth: null}));
    throw new Error('Assertion failure');
}
