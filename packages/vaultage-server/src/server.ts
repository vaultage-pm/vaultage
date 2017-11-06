/**
 * Standalone server entry point.
 *
 * This file is only used to test the package on its own. It is not used in
 */
import * as express from 'express';

import { API } from './';

const app = express();

API.create(app);

app.listen(3000, () => {
    console.log('Test server listening on port 3000');
});
