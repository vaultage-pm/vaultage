import 'reflect-metadata';

import { json } from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import { useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { API } from './API';
import { CipherRepository } from './storage/CipherRepository';
import { JSONCipherRepository } from './storage/JSONCipherRepository';

useContainer(Container);

// Sets defaults
Container.set('cipherLocation', path.join(__dirname, '..', 'cipher.json'));
Container.set('config', {
    salts: {
        USERNAME_SALT: 'nosalt'
    }
});
Container.set(CipherRepository, Container.get(JSONCipherRepository));

const app = express();

// Allow requests from all origins.
// We can do this because we don't have actual sessions and there is nothing more to be obtained
// from the server if an attacker initiates a request from the victim's browser as opposed to if he initiates
// it from anywhere else
app.use(cors());

// I/O protocol is JSON based
app.use(json());
// Bind API to server
API.create(app);
// Bind static content to server
app.use(express.static(path.join(path.dirname(require.resolve('vaultage-ui-webcli')), 'public')));
 
// run koa application on port 3000
app.listen(3000, () => {
    console.log('Dev server is listening on port 3000');
});
