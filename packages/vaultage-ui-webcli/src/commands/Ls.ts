import { Config } from '../Config';
import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LsCommand implements ICommand {
    public readonly name = 'ls';

    public readonly description = 'If authenticated, lists the vault content.';

    constructor(
        private shell: Shell,
        private config: Config,
        private ctx: Context) {
    }

    public async handle() {

        this.shell.echo('Vault revision #' + this.ctx.vault.getDBRevision() + ', ' + this.ctx.vault.getNbEntries() + ' entries.');
        const allEntries = this.ctx.vault.getAllEntries();
        const vef = new VaultEntryFormatter(this.config);
        const html = vef.formatAndHighlightBatch(allEntries);
        if (!html.isEmpty()) {
            this.shell.echoHTML(html);
        }
    }
}
