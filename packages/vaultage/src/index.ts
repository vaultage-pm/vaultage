import * as path from 'path';
import * as express from 'express';
import { API } from 'vaultage-server';

const app = express();

// Bind API to server
API.create(app);
// Bind static content to server
app.use(express.static(path.join(path.dirname(require.resolve('vaultage-web-cli')), 'public')));
 
// run koa application on port 3000
app.listen(3000, () => {
    console.log('Dev server is listening on port 3000');
});
