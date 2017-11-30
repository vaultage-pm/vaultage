import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Pulls the encrypted database, and decrypts it locally.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        if (!this.vault.isAuth()) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        this.shell.echo(`Attempting to pull the encrypted database ...`);

        await new Promise((resolve, reject) => this.vault.pull((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        this.shell.echo('Pull OK, got ' + this.vault.getNbEntries() + ' entries (revision ' + this.vault.getDBRevision() + ').');
        this.shell.separator();
    }
}
