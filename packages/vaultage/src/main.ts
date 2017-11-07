import * as path from 'path';
import * as express from 'express';
import { API } from './API';
import * as cors from 'cors';

const app = express();

// Allow requests from all origins.
// We can do this because we don't have actual sessions and there is nothing more to be obtained
// from the server if an attacker initiates a request from the victim's browser as opposed to if he initiates
// it from anywhere else
app.use(cors());
// Bind API to server
API.create(app);
// Bind static content to server
app.use(express.static(path.join(path.dirname(require.resolve('vaultage-ui-webcli')), 'public')));
 
// run koa application on port 3000
app.listen(3000, () => {
    console.log('Dev server is listening on port 3000');
});
