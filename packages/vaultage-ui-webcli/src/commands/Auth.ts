import * as vaultage from 'vaultage-client';
import { Config } from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { TimeoutService } from '../TimeoutService';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class AuthCommand implements ICommand {
    public readonly name = 'auth';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    private defaultURL = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}${location.pathname}`;

    constructor(
        private shell: Shell,
        private ctx: Context,
        private config: Config,
        private timeout: TimeoutService) {
    }

    public async handle(args: string[]) {
        const serverUrl = args.length > 0 ? args[0] : (this.config.defaultHost || this.defaultURL);

        let username: string = '';
        if (this.config.defaultUserName !== '') {
            username = this.config.defaultUserName;
            this.shell.echo(`Connecting to ${username}@${serverUrl}...`);
        } else {
            this.shell.echo(`Connecting to ${serverUrl}...`);
            username = await this.shell.prompt('Username:', this.config.defaultUserName, this.config.colorUsernamePrompt);
        }

        const masterpwd = await this.shell.promptSecret('Password:');

        this.shell.echo(`Attempting to login ${username}@${serverUrl}...`);

        this.ctx.vault = await vaultage.login(serverUrl, username, masterpwd);

        this.shell.echo('Pull OK, got ' + this.ctx.vault.getNbEntries() + ' entries (revision ' +
            this.ctx.vault.getDBRevision() + ').');

        if (this.ctx.vault.isInDemoMode()) {
            this.shell.echoHTML(html`<span class="warning">[warning] This vault is is <b>demo-mode</b>: you can play around, but changes you make will not persist.</span>`);
        }

        this.timeout.resetTimeout();
    }
}
