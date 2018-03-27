import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { IVaultageConfig } from 'vaultage-protocol';

import { CONFIG_FILENAME } from '../constants';

const SALTS_LENGTH = 64;

/**
 * Returns the absolute path to some file in the storage directory.
 *
 * @param fileName File to search
 * @param override Force a different storage path than the default
 */
export function storagePath(fileName: string, override: string | undefined): string {
    const vaultageConfigDir = override != null ? override : path.join(require('os').homedir(), '.vaultage');

    if (!fs.existsSync(vaultageConfigDir)) {
        fs.mkdirSync(vaultageConfigDir);
    }

    return path.join(vaultageConfigDir, fileName);
}

export function initConfig(customStorage: string | undefined): Promise<void> {
    return new Promise((resolve, reject) => {

        // Get random bytes for salts generation.
        // SALT_LENGTH is the lenght in hexadecimal of each salt
        // so we neeed SALT_LENGTH/2 * number_of_salts bytes in total.
        crypto.randomBytes(2 * SALTS_LENGTH, (err, buf) => {
            if (err) {
                return reject(err);
            }

            const hexbytes = buf.toString('hex');

            const config: IVaultageConfig = {
                version: 1,
                salts: {
                    local_key_salt: hexbytes.substr(0, SALTS_LENGTH),
                    remote_key_salt: hexbytes.substr(SALTS_LENGTH, 2 * SALTS_LENGTH)
                }
            };

            const configPath = storagePath(CONFIG_FILENAME, customStorage);
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
