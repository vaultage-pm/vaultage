import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { IVaultageConfig } from '../../src/apiServer';
import { CONFIG_FILENAME } from '../constants';

const SALTS_LENGTH = 64;

export function absolutePath(fileName: string): string {
    const vaultageConfigDir = path.join(require('os').homedir(), '.vaultage');

    if (!fs.existsSync(vaultageConfigDir)) {
        fs.mkdirSync(vaultageConfigDir);
    }

    return path.join(vaultageConfigDir, fileName);
}

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
                default_user: 'lbarman',
                salts: {
                    local_key_salt: hexbytes.substr(0, SALTS_LENGTH),
                    remote_key_salt: hexbytes.substr(0, SALTS_LENGTH)
                }
            };

            const configPath = absolutePath(CONFIG_FILENAME);
            fs.writeFile(configPath, JSON.stringify(config), { encoding: 'utf-8' }, (err2) => {
                if (err2) {
                    return reject(err2);
                }
                resolve();
            });
            console.log('Done.');
        });
    });
}
