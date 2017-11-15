import { createVaultageAPIServer } from './apiServer';
import 'reflect-metadata';

import * as express from 'express';
import * as path from 'path';
import { useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { DatabaseWithAuth } from './storage/Database';
import { JSONDatabaseWithAuth } from './storage/JSONDatabase';


/*
    main.ts - entry file of the vaultage server.

    This file creates a web server which serves both the Vaultage API
    as well as the default web client.
    The dependency injection wiring happens in this file as well.
    Everything done here is stuff we do not want to do when unit testing
    (ie. binding to a TCP port or injecting actual I/O-bound dependencies).
*/

// Tell routing-controller to use our dependency injection container
useContainer(Container);

// Wires all dependencies
Container.set('cipherLocation', path.join(__dirname, '..', 'cipher.json'));
// TODO: Use a config store. The store could for instance pull config data
// from a JSON file at a predefined or command-line defined location.
Container.set('config', {
    salts: {
        USERNAME_SALT: 'nosalt'
    }
});
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
