import { Context } from '../Context';

import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LogoutCommand implements ICommand {
    public readonly name = 'logout';

    public readonly description = 'Clears all local sensitive information.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        this.ctx.unsetVault();
        this.shell.echo('Logout OK.');
        this.shell.separator();
    }
}
