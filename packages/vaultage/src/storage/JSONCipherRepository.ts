import { NotFastForwardError } from './NotFastForwardError';
import { AuthenticationError } from './AuthenticationError';
import { CipherRepository, ICipherSaveOptions, IRepositoryCredentials, IUserRepository } from './CipherRepository';
import { Inject, Service } from 'typedi';
import * as fs from 'fs';

interface JSONCipherFile {
    version: number;
    hash: string;
    data: string;
    username: string;
    password: string;
}

export class JSONCipherUserRepository implements IUserRepository {

    constructor(
            private readonly cipherLocation: string,
            private readonly username: string,
            private readonly password: string) {
    }

    public async save(cipher: string, options: ICipherSaveOptions): Promise<string> {
        const data: JSONCipherFile = {
            version: 1,
            hash: options.new_hash,
            data: cipher,
            username: this.username,
            password: this.password
        }
        if (!options.force) {
            const file = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as JSONCipherFile;
            if (file.hash !== options.old_hash) {
                throw new NotFastForwardError();
            }
        }
        fs.writeFileSync(this.cipherLocation, JSON.stringify(data), {
            encoding: 'utf-8'
        });
        return cipher;
    }

    public async load(): Promise<string> {
        try {
            const data = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as JSONCipherFile;
            return data.data;
        } catch(e) {
            if (e && e.code === 'ENOENT') {
                return '';
            }
            throw e;
        }
    }
}

@Service()
export class JSONCipherRepository extends CipherRepository {

    @Inject('cipherLocation')
    private readonly cipherLocation: string;

    async auth(creds: IRepositoryCredentials) {
        try {
            const contents = JSON.parse(fs.readFileSync(this.cipherLocation, {
                encoding: 'utf-8'
            })) as JSONCipherFile;

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
        return new JSONCipherUserRepository(this.cipherLocation, creds.username, creds.password);
    }
}
