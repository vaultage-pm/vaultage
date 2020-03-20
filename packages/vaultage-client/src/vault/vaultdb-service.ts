import { injectable } from 'tsyringe';

import { IVaultDBEntry } from '../interface';
import { PasswordsService } from '../passwords/passwords-service';
import { ERROR_CODE, VaultageError } from '../VaultageError';
import { VaultDB } from './VaultDB';

@injectable()
export class VaultDBService {

    constructor(private readonly passwordsService: PasswordsService) { }

    public createEmpty(): VaultDB {
        return new VaultDB(this.passwordsService, {});
    }

    public serialize(db: VaultDB): string {
        const entries = db.getAll();

        const serialized = JSON.stringify({
            entries: entries,
            version: VaultDB.VERSION,
            revision: db.revision
        });

        return serialized;
    }

    public deserialize(json: string): VaultDB {

        const entries: {
            [key: string]: IVaultDBEntry
        } = {};

        // return empty DB
        if (json === '') {
            return new VaultDB(this.passwordsService, entries, 0);
        }

        const data = JSON.parse(json);

        for (const entry of data.entries) {
            if (entries[entry.id] != null) {
                throw new VaultageError(ERROR_CODE.DUPLICATE_ENTRY, 'Duplicate entry with id: ' + entry.id + ' in vault.');
            }
            entries[entry.id] = entry;
        }

        return new VaultDB(this.passwordsService, entries, data.revision);
    }
}