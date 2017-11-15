import 'reflect-metadata';

import { json } from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import { useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { VaultageServer } from './VaultageServer';
import { DatabaseWithAuth } from './storage/Database';
import { JSONDatabaseWithAuth } from './storage/JSONDatabase';

//TODO lb->hmil: Quelle est l'utilité de cette abstraction ? pourquoi pas
/*
const cipherLocation = ...
const config = ...
const DatabaseWithAuth = ...
*/
// ou même dans un ServerState={} que l'on controle, plutôt qu'une struct avec des set et get qui casse le
// checking des noms à la compilation (e.g. .get("cypherLocation"))
useContainer(Container);

// Sets defaults
Container.set('cipherLocation', path.join(__dirname, '..', 'cipher.json'));
Container.set('config', {
    salts: {
        USERNAME_SALT: 'nosalt'
    }
});
Container.set(DatabaseWithAuth, Container.get(JSONDatabaseWithAuth));

const expressServer = express();

// Allow requests from all origins.
// We can do this because we don't have actual sessions and there is nothing more to be obtained
// from the server if an attacker initiates a request from the victim's browser as opposed to if he initiates
// it from anywhere else
expressServer.use(cors());

// I/O protocol is JSON based
expressServer.use(json());

// Bind API to server
//TODO lb->hmil : Pas convaincu que l'abstraction "VaultageServer" ait une utilité. Tu voyais ça pour la suite ?
// sinon juste :
/*
useExpressServer(expressServer, {
    controllers: [
        CipherController,
        ConfigController
    ]
    });
*/
// ça évite une class et un fichier en plus, et de se surcharger la stack mentale d'une abstraction en plus
VaultageServer.bindToServer(expressServer);

// Bind static content to server
//TODO lb->hmil: could we also serve, on a different port perhaps, the simple-web-gui ?
const pathToWebCliGUI = path.dirname(require.resolve('vaultage-ui-webcli'));
const staticDirToServer = path.join(pathToWebCliGUI, 'public');
expressServer.use(express.static(staticDirToServer));
 
// run application on port 3000
expressServer.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
