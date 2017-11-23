import * as fs from 'fs';
import { Inject, Service } from 'typedi';

import { AuthenticationError } from './AuthenticationError';
import { DatabaseWithAuth, ICredentials, IDatabase, IDatabaseSaveParameters } from './Database';
import { NotFastForwardError } from './NotFastForwardError';

/**
 * The structure of the content of this database.
 */
export interface IDatabaseContents {
    version: number;
    hash: string;
    data: string;
    username: string;
    password: string;
}

/**
 * This class is a simple database that only use a file storage.
 * It provides the Vaultage-compliant API of "save" and "load".
 * Save uses a hashchain to ensure serializability.
 */
export class JSONDatabase implements IDatabase {

    constructor(
            private readonly cipherLocation: string,
            private readonly username: string,
            private readonly password: string) {
    }

    public async save(update: IDatabaseSaveParameters): Promise<string> {
        let password = this.password;

        if (update.new_password != null) {
            password = update.new_password;
        }

        const data: IDatabaseContents = {
            version: 1,
            hash: update.new_hash,
            data: update.new_data,
            username: this.username,
            password: password
        };

        if (!update.force && fs.existsSync(this.cipherLocation)) {
            // read the current database content (without this update)
            const file = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as IDatabaseContents;

            // if we did not provide the correct old hash, we refuse the update
            if (file.hash !== update.old_hash) {
                throw new NotFastForwardError();
            }
        }
        // either it is fast-forward (old hash correctly provided),
        // or forced; anyway, we process the udpate
        fs.writeFileSync(this.cipherLocation, JSON.stringify(data), {
            encoding: 'utf-8'
        });
        return update.new_data;
    }

    /**
     * Simply returns the data field of the DatabaseContents
     */
    public async load(): Promise<string> {
        try {
            const data = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as IDatabaseContents;
            return data.data;
        } catch (e) {
            if (e && e.code === 'ENOENT') {
                return '';
            }
            throw e;
        }
    }
}

/**
 * This class is a wrapper around JSONDatabase.
 * It exposes the "auth" methods that return a JSONDatabase.
 */
@Service()
export class JSONDatabaseWithAuth extends DatabaseWithAuth {

    @Inject('cipherLocation')
    private readonly cipherLocation: string;

    public async auth(creds: ICredentials) {
        try {
            const contents = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as IDatabaseContents;

            // Leaks informations by timing analysis but proper bruteforce protection makes it impractical,
            // also knowledge of the remote key doesn't relly help as one needs the local key to decrypt passwords.
            if ( !this.constantTimeComparison(contents.username, creds.username) ||
                !this.constantTimeComparison(contents.password, creds.password)) {
                throw new AuthenticationError();
            }
        } catch (e) {
            // Ignore the error if the file does not exist and proceed with returning a repository
            if (!e || e.code !== 'ENOENT') {
                throw e;
            }
        }
        return new JSONDatabase(this.cipherLocation, creds.username, creds.password);
    }

    /**
     * Performs a constant-time comparison of two strings.
     * Returns true iff a===b
     * If a || b is null or undefined, immediately returns false (not time-constant)
     */
    private constantTimeComparison(a: string, b: string): boolean {

        if (a == null || b == null) {
            return false;
        }

        let result: boolean = true;

        if (a.length !== b.length) {
            result = false;
        }

        const minLength = Math.min(a.length, b.length);

        for (let i = 0; i < minLength; i++) {
            const charA = a[i];
            const charB = b[i];

            if (charA !== charB) {
                result = false;
            }
        }

        return result;
    }
}
