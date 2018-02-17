import * as vaultage from 'vaultage-client';

import { Config } from '../Config';
import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class AuthCommand implements ICommand {
    public readonly name = 'auth';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    private defaultURL = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}${location.pathname}`;

    constructor(
        private shell: Shell,
        private ctx: Context,
        private config: Config) {
    }

    public async handle(args: string[]) {
        const serverUrl = args.length > 0 ? args[0] : this.defaultURL;

        const username = await this.shell.prompt('Username:', this.config.getDefaultUserName());
        const masterpwd = await this.shell.promptSecret('Password:');

        this.shell.echo(`Attempting to login ${username}@${serverUrl}...`);

        this.ctx.vault = await vaultage.login(serverUrl, username, masterpwd);

        this.shell.echo('Pull OK, got ' + this.ctx.vault.getNbEntries() + ' entries (revision ' +
            this.ctx.vault.getDBRevision() + ').');
        this.shell.separator();
    }
}
