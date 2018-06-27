import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class DumpCommand implements ICommand {
    public readonly name = 'dump';

    public readonly description = 'Dumps the plaintext of the database in JSON. *store with caution*';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        const allEntries = this.ctx.vault.getAllEntries();
        this.shell.echo(JSON.stringify(allEntries));
    }
}
