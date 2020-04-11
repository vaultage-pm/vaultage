import 'reflect-metadata';

import program from 'commander';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { container } from 'tsyringe';
import { VaultageConfig } from 'vaultage-protocol';

import { ApiService, CONFIG_TOKEN, DB_TOKEN } from './api-service';
import { CONFIG_FILENAME, VAULT_FILENAME } from './constants';
import { CIPHER_TOKEN, JSONDatabaseWithAuth } from './storage/JSONDatabase';
import { initConfig, storagePath } from './tools/initConfig';

// tslint:disable-next-line:no-var-requires
const pkg = require(path.join(__dirname, '../../package.json'));

/*
    main.ts - entry file of the vaultage server.

    This file creates a web server which serves both the Vaultage API
    as well as the default web client.
    The dependency injection wiring happens in this file as well.
    Everything done here is stuff we do not want to do when unit testing
    (ie. binding to a TCP port or injecting actual I/O-bound dependencies).
*/

program.version(pkg.version)
    .option('-p, --port <port>', 'TCP port to listen to', parseInt)
    .option('-l, --listen <addr>', 'TCP address to bind to')
    .option('-d, --data <dir>', 'Manually specify the data directory (defaults to ~/.vaultage)')
    .option('--demo', 'Start vaultage in demo mode.')
    .parse(process.argv);

const PORT: number = program.port || 3000;
const ADDR: string = program.listen;
const DEMO: boolean = program.demo;

boot(PORT, ADDR).catch(e => console.error(e));

async function loadConfig(retry: boolean): Promise<VaultageConfig> {
    const configPath = storagePath(CONFIG_FILENAME, program.data);
    try {
        return VaultageConfig.check(JSON.parse(fs.readFileSync(configPath, { encoding: 'utf-8' })));
    } catch (e) {
        if (retry && e.code === 'ENOENT') {
            console.log('No config found, writing initial config.');
            await initConfig(program.data, DEMO);
            return loadConfig(false);
        }
        console.error(`Unable to read config file. Make sure ${configPath} exists and is readable`);
        throw e;
    }
}

async function boot(port: number, addr: string) {
    // Wires all dependencies
    const vaultPath = storagePath(VAULT_FILENAME, program.data);
    container.register(CIPHER_TOKEN, { useValue: vaultPath });

    const config = await loadConfig(true);
    container.register(CONFIG_TOKEN, { useValue: config });
    container.registerSingleton(DB_TOKEN, JSONDatabaseWithAuth);

    // Create an express server which is preconfigured to serve the API
    const server = container.resolve(ApiService).createVaultageAPIServer();

    // Bind static content to server
    const pathToWebCliGUI = path.dirname(require.resolve('vaultage-ui-webcli'));
    const staticDirToServer = path.join(pathToWebCliGUI, 'public');
    server.use(express.static(staticDirToServer));
    const pathToPWA = path.dirname(require.resolve('vaultage-pwa'));
    server.use('/pwa', express.static(pathToPWA));

    // run application on port port
    server.listen(port, addr, () => {
        console.log(`Server is listening on port ${port}`);
    });
}
