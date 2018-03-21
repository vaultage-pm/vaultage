import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PushCommand implements ICommand {
    public readonly name = 'push';

    public readonly description = 'Pushes an encrypted version of the local db to the server. Does not erase if not fast-forward.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        this.shell.echo(`Attempting to push the encrypted database ...`);

        await this.ctx.vault.save();

        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
