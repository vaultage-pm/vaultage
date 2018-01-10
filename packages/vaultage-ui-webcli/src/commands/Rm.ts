import { Global } from '../Global';
import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class RmCommand implements ICommand {
    public readonly name = 'rm';

    public readonly description = 'Removes an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell) {
    }

    public async handle(args: string[]) {

        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        let id: string;
        if (args.length === 0) {
            id = await this.shell.prompt('Entry ID:');
        } else {
            id = args[0];
        }

        const e = Global.vault.getEntry(id);
        this.shell.echoHTML(VaultEntryFormatter.formatSingle(e));

        const answer = await this.shell.prompt('Confirm removal of entry #' + id + ' ? [y/N]');

        if (answer !== 'y' && answer !== 'Y') {
            this.shell.echo('Cancelled.');
            return;
        }

        Global.vault.removeEntry(id);
        this.shell.echo('Remove entry #' + id);

        await new Promise((resolve, reject) => Global.vault && Global.vault.save((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        this.shell.echo('Push OK, revision ' + Global.vault.getDBRevision() + '.');
        this.shell.separator();
    }
}
