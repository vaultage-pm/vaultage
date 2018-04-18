import * as vaultage from 'vaultage-client';

import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class TimeoutCall implements ICommand {
    public readonly name = 'timeout_call';

    public readonly description = 'Hidden command executed when the session times out.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        if (!this.ctx.isAuthenticated()) {
            return;
        }
        const username = this.ctx.vault.username;
        const serverURL = this.ctx.vault.serverURL;
        this.ctx.unsetVault();
        this.shell.clearLog();
        this.shell.echo('Session timed out. Please re-enter the master password.');
        while (1) {
            const password = await this.shell.promptSecret('Password:');
            try {
                this.ctx.vault = await vaultage.login(serverURL, username, password);
                this.shell.clearLog();
                this.shell.printBanner();
                this.shell.echo('Login successful');
                return;
            } catch (e) {
                this.shell.echoError(e);
            }
        }
    }
}
