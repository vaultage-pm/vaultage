import { IVaultDBEntryAttrs } from 'vaultage-client';

import { IVaultageConfig } from '../../vaultage/src/VaultageConfig';
import { Vault } from '../vaultage';

async function runIntegrationTest() {
    try {
        const salts = this.config.getSalts();

        const serverUrl = 'http://localhost:3000/';
        const username = 'any';
        const masterpwd = 'masterpwd';
        let config: IVaultageConfig;

        // fetch config
        console.log('Trying to contact Vaultage server on', serverUrl);
        $.ajax({
            async: false,
            type: 'GET',
            url: serverUrl + 'config',
            success: (data) => {
                config = (data as IVaultageConfig);
            }
        });

        console.log('Got the config, continuing...');

        // create vault
        let vault = new Vault();

        // authenticate and pull ciphers
        await new Promise((resolve, reject) => this.vault.auth(serverUrl, username, masterpwd, config.salts, (err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

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

        await new Promise((resolve, reject) => this.vault.save((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        // log out and pull again
        console.log('Logging out...');

        vault = new Vault();


        // authenticate and pull ciphers
        await new Promise((resolve, reject) => this.vault.auth(serverUrl, username, masterpwd, config.salts, (err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        if (vault.getNbEntries() !== 1) {
            throw new Error('Could not get back the entry we just created.');
        }

        const e = vault.getEntry('0');

        if (e.title !== newEntry.title) {
            throw new Error('The fetched entry has a different title than the created entry.');
        }
        if (e.login !== newEntry.login) {
            throw new Error('The fetched entry has a different login than the created entry.');
        }
        if (e.password !== newEntry.password) {
            throw new Error('The fetched entry has a different password than the created entry.');
        }
        if (e.url !== newEntry.url) {
            throw new Error('The fetched entry has a different url than the created entry.');
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
        await new Promise((resolve, reject) => this.vault.save((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        console.log('Manually pulling the db...');

        // try to manually pull the db
        await new Promise((resolve, reject) => this.vault.pull((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        if (vault.getNbEntries() !== 1) {
            throw new Error('Could not get back the entry we just edited.');
        }

        const e2 = vault.getEntry('0');

        if (e2.title !== newEntry2.title) {
            throw new Error('The fetched entry has a different title than the created entry.');
        }
        if (e2.login !== newEntry2.login) {
            throw new Error('The fetched entry has a different login than the created entry.');
        }
        if (e2.password !== newEntry2.password) {
            throw new Error('The fetched entry has a different password than the created entry.');
        }
        if (e2.url !== newEntry2.url) {
            throw new Error('The fetched entry has a different url than the created entry.');
        }

        console.log('Entry correctly edited ! Now trying to change the master password...');

        const newMasterPassword = 'masterpwd2';

        await new Promise((resolve, reject) => this.vault.updateMasterPassword(newMasterPassword, (err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        // log out and pull again
        console.log('Logging out...');

        vault = new Vault();

        // authenticate and pull ciphers
        await new Promise((resolve, reject) => this.vault.auth(serverUrl, username, newMasterPassword, config.salts, (err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        // check if the vault content is as expected

        if (vault.getNbEntries() !== 1) {
            throw new Error('Could not get back the entry.');
        }

        const e3 = vault.getEntry('0');

        if (e3.title !== newEntry2.title) {
            throw new Error('The fetched entry has a different title than the created entry.');
        }
        if (e3.login !== newEntry2.login) {
            throw new Error('The fetched entry has a different login than the created entry.');
        }
        if (e3.password !== newEntry2.password) {
            throw new Error('The fetched entry has a different password than the created entry.');
        }
        if (e3.url !== newEntry2.url) {
            throw new Error('The fetched entry has a different url than the created entry.');
        }

        console.log('Trying to delete the entry...');

        vault.removeEntry('0');

        if (vault.getNbEntries() !== 0) {
            throw new Error('Could not delete the entry.');
        }

        console.log('Success. Trying to logout...');

        vault.unauth();

        console.log('Trying to pull the cipher (should fail)');

        // try to manually pull the db (should fail - resolve/reject inverted)
        await new Promise((resolve, reject) => this.vault.pull((err) => {
            if (err != null) {
                resolve();
            } else {
                reject('Managed to pull the cipher eventhough we are not authenticated !');
            }
        }));

        console.log('Everything went well ! Test OK.');
        process.exit(0);

    } catch (e) {
        console.log('Error:', e);
        process.exit(1);
    }
}

runIntegrationTest();
