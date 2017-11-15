import { NotFastForwardError } from './NotFastForwardError';
import { AuthenticationError } from './AuthenticationError';
import { DatabaseWithAuth, DataSaveParameters, RepositoryCredentials, Database } from './Database';
import { Inject, Service } from 'typedi';
import * as fs from 'fs';

/**
 * The structure of the content of this database.
 */
interface DatabaseContents {
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
export class JSONDatabase implements Database {

    constructor(
            private readonly cipherLocation: string,
            private readonly username: string,
            private readonly password: string) {
    }

    public async save(update: DataSaveParameters): Promise<string> {
        const data: DatabaseContents = {
            version: 1,
            hash: update.new_hash,
            data: update.new_data,
            username: this.username,
            password: this.password
        }
        if (!update.force && fs.existsSync(this.cipherLocation)) {
            // read the current database content (without this update)
            const file = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as DatabaseContents;

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
            })) as DatabaseContents;
            return data.data;
        } catch(e) {
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

    async auth(creds: RepositoryCredentials) {
        try {
            const contents = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as DatabaseContents;

            // Leaks informations by timing analysis but proper bruteforce protection makes it impractical
            // TODO Ludo: What if someone steals the creds w/ timing analysis and then uses the "force"
            // parameter on "push" to overwrite the user's passwords?
            if (contents.username !== creds.username || contents.password !== creds.password) {
                throw new AuthenticationError();
            }
        } catch(e) {
            // Ignore the error if the file does not exist and proceed with returning a repository
            if (!e || e.code !== 'ENOENT') {
                throw e;
            }
        }
        return new JSONDatabase(this.cipherLocation, creds.username, creds.password);
    }
}
