import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class RmCommand implements ICommand {
    public readonly name = 'rm';

    public readonly description = 'Removes an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle(args: string[]) {

        let id: string;
        if (args.length === 0) {
            id = await this.shell.prompt('Entry ID:');
        } else {
            id = args[0];
        }

        const e = this.ctx.vault.getEntry(id);
        this.shell.echoHTML(VaultEntryFormatter.formatSingle(e));

        const answer = await this.shell.promptYesNo(`'Confirm removal of entry #${id}?`);
        if (answer !== 'yes') {
            this.shell.echo('Cancelled.');
            return;
        }

        this.ctx.vault.removeEntry(id);
        this.shell.echo('Remove entry #' + id);

        await this.ctx.vault.save();

        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
        this.shell.separator();
    }
}
