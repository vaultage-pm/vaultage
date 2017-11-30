import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PushCommand implements ICommand {
    public readonly name = 'push';

    public readonly description = 'Pushes an encrypted version of the local db to the server. Does not erase if not fast-forward.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        if (!this.vault.isAuth()) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        this.shell.echo(`Attempting to push the encrypted database ...`);

        await new Promise((resolve, reject) => this.vault.save((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        this.shell.echo('Push OK, revision ' + this.vault.getDBRevision() + '.');
        this.shell.separator();
    }
}
