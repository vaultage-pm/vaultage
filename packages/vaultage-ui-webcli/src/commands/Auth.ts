import { Vault } from 'vaultage-client';

import * as config from '../../config';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class AuthCommand implements ICommand {
    public readonly name = 'auth';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    private defaultURL;

    constructor(
            private vault: Vault,
            private shell: Shell) {
        this.defaultURL = location.protocol + '//' + location.hostname +
         (location.port ? ':' + location.port : '') + location.pathname;
    }

    public async handle(args: string[]) {
        const serverUrl = args.length > 0 ? args[0] : this.defaultURL;
        try {
            const username = await this.shell.prompt('Username:', config.DEFAULT_USER);
            const masterpwd = await this.shell.promptSecret('Password:');

            this.shell.echo(`Attempting to login ${username}@${this.defaultURL}...`);

            await new Promise((resolve, reject) => this.vault.auth(serverUrl, username, masterpwd, (err) => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            }));

            this.shell.echo('Pull OK, got ' + this.vault.getNbEntries() + ' entries (revision ' + 
                            this.vault.getDBRevision() + ').');
        } catch (e) {
            this.shell.echoError(e.toString());
        }
    }
}
