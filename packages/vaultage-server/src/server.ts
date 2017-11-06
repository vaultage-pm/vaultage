/**
 * Standalone server entry point.
 *
 * This file is only used to test the package on its own. It is not used in the final product.
 */
import * as express from 'express';
import * as cors from 'cors';

import { API } from './';

const app = express();

app.use(cors());
API.create(app);

app.listen(3000, () => {
    console.log('Test server listening on port 3000');
});
