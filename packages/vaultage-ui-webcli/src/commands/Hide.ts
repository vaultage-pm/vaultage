import { Config } from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';


export class HideCommand implements ICommand {
    public readonly name = 'hide';

    public readonly description = 'Hides (but does not remove) an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell,
        private config: Config,
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

        // toggle hidden
        e.hidden = !e.hidden;

        this.ctx.vault.updateEntry(id, e);
        const entry2 = this.ctx.vault.getEntry(id);

        const vef = new VaultEntryFormatter(this.config);
        if (entry2.hidden) {
            this.shell.echoHTML(html`This entry is now <b>hidden</b> :`);
        } else {
            this.shell.echoHTML(html`This entry is now <b>visible</b> :`);
        }
        this.shell.echoHTML(vef.formatSingle(entry2));

        await this.ctx.vault.save();
        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
