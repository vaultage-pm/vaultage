import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Pulls the encrypted database, and decrypts it locally.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {

        this.shell.echo(`Attempting to pull the encrypted database ...`);

        await this.ctx.vault.pull();

        this.shell.echo('Pull OK, got ' + this.ctx.vault.getNbEntries() + ' entries (revision ' + this.ctx.vault.getDBRevision() + ').');
        this.shell.separator();
    }
}
