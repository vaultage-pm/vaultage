import { Global } from '../Global';
import * as vaultage from 'vaultage-client';

import { Config } from '../Config';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class AuthCommand implements ICommand {
    public readonly name = 'auth';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    private defaultURL;

    constructor(
        private shell: Shell,
        private config: Config) {
        this.defaultURL = location.protocol + '//' + location.hostname +
            (location.port ? ':' + location.port : '') + location.pathname;
    }

    public async handle(args: string[]) {
        const serverUrl = args.length > 0 ? args[0] : this.defaultURL;

        const username = await this.shell.prompt('Username:', this.config.getDefaultUserName());
        const masterpwd = await this.shell.promptSecret('Password:');

        this.shell.echo(`Attempting to login ${username}@${this.defaultURL}...`);

        Global.vault = await vaultage.login(serverUrl, username, masterpwd);

        this.shell.echo('Pull OK, got ' + Global.vault.getNbEntries() + ' entries (revision ' +
            Global.vault.getDBRevision() + ').');
        this.shell.separator();
    }
}
