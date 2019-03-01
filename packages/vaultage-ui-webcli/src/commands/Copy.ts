import * as copy from 'copy-to-clipboard';
import { Config } from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class CopyCommand implements ICommand {
    public readonly name = 'copy';

    public readonly description = 'Copy the password field of the given entry in the clipboard.';

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
        copy(e.password);

        const vef = new VaultEntryFormatter(this.config);
        this.shell.echoHTML(vef.formatSingle(e));
        this.shell.echoHTML(html`Copied to the clipboard !`);

        // update usage count
        this.ctx.vault.entryUsed(id);
        await this.ctx.vault.save();

        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
