import { Inject, Service } from 'typedi';
import * as fs from 'fs';

export interface ICipherSaveOptions {
    old_hash?: string;

    force?: boolean;
}

@Service()
export class CipherRepository {

    @Inject('cipherLocation')
    private readonly cipherLocation: string;

    public async save(cipher: string, _options: ICipherSaveOptions): Promise<void> {
        fs.writeFileSync(this.cipherLocation, cipher);
    }

    public async load(): Promise<string> {
        try {
            const data = await new Promise<Buffer>((resolve, reject) => {
                fs.readFile(this.cipherLocation, (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res);
                });
            });
            return data.toString('utf-8');
        } catch(e) {
            if (e && e.code === 'ENOENT') {
                return '';
            }
            throw e;
        }
    }
}
