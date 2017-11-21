import * as crypto from 'crypto';
import * as fs from 'fs';

import { IVaultageConfig } from '../../src/apiServer';
import { CONFIG_PATH } from '../constants';

const SALTS_LENGTH = 64;

export function initConfig(): Promise<void> {
    return new Promise((resolve, reject) => {

        // Get random bytes for salts generation.
        // SALT_LENGTH is the lenght in hexadecimal of each salt
        // so we neeed SALT_LENGTH/2 * number_of_salts bytes in total.
        crypto.randomBytes(SALTS_LENGTH, (err, buf) => {
            if (err) {
                return reject(err);
            }

            const hexbytes = buf.toString('hex');

            const config: IVaultageConfig = {
                version: 1,
                DEFAULT_USER: 'lbarman',
                SALTS: {
                    LOCAL_KEY_SALT: hexbytes.substr(0, SALTS_LENGTH),
                    REMOTE_KEY_SALT: hexbytes.substr(0, SALTS_LENGTH)
                }
            };

            fs.writeFile(CONFIG_PATH, JSON.stringify(config), { encoding: 'utf-8' }, (err2) => {
                if (err2) {
                    return reject(err2);
                }
                resolve();
            });
            console.log('Done.');
        });
    });
}
