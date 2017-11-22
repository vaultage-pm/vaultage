import 'reflect-metadata';

import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { createVaultageAPIServer, IVaultageConfig } from './apiServer';
import { CONFIG_FILENAME, VAULT_FILENAME } from './constants';
import { DatabaseWithAuth } from './storage/Database';
import { JSONDatabaseWithAuth } from './storage/JSONDatabase';
import { storagePath, initConfig } from './tools/initConfig';


/*
    main.ts - entry file of the vaultage server.

    This file creates a web server which serves both the Vaultage API
    as well as the default web client.
    The dependency injection wiring happens in this file as well.
    Everything done here is stuff we do not want to do when unit testing
    (ie. binding to a TCP port or injecting actual I/O-bound dependencies).
*/

async function loadConfig(retry: boolean): Promise<void> {
    const configPath = storagePath(CONFIG_FILENAME);
    try {
        const config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf-8' })) as IVaultageConfig;
        Container.set('config', config);
    } catch (e) {
        if (retry && e.code === 'ENOENT') {
            console.log('No config found, writing initial config.');
            await initConfig();
            return loadConfig(false);
        }
        console.error(`Unable to read config file. Make sure ${configPath} exists and is readable`);
        throw e;
    }
}

async function boot() {
    // Tell routing-controller to use our dependency injection container
    useContainer(Container);

    // Wires all dependencies
    const vaultPath = storagePath(VAULT_FILENAME);
    Container.set('cipherLocation', vaultPath);

    await loadConfig(true);

    Container.set(DatabaseWithAuth, Container.get(JSONDatabaseWithAuth));

    // Create an express server which is preconfigured to serve the API
    const server = createVaultageAPIServer();

    // Bind static content to server
    const pathToWebCliGUI = path.dirname(require.resolve('vaultage-ui-webcli'));
    const staticDirToServer = path.join(pathToWebCliGUI, 'public');
    server.use(express.static(staticDirToServer));

    // run application on port 3000
    server.listen(3000, () => {
        console.log('Server is listening on port 3000');
    });
}

boot();
