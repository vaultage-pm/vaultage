import { Global } from '../Global';
import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PushCommand implements ICommand {
    public readonly name = 'push';

    public readonly description = 'Pushes an encrypted version of the local db to the server. Does not erase if not fast-forward.';

    constructor(
        private shell: Shell) {
    }

    public async handle() {
        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        this.shell.echo(`Attempting to push the encrypted database ...`);

        await new Promise((resolve, reject) => Global.vault.save((err) => {
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
