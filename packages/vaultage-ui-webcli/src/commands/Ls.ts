import { IVaultDBEntry } from 'vaultage-client/dist/src/vaultage';
import { Config } from '../Config';
import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LsCommand implements ICommand {
    public readonly name = 'ls';

    public readonly description = 'If authenticated, lists the vault content. Use --hidden to show the hidden entries.';

    constructor(
        private shell: Shell,
        private config: Config,
        private ctx: Context) {
    }

    public async handle(flags: string[]) {

        // flag to show all results
        const showHiddenEntries = flags.some((s) => s === '--hidden');


        this.shell.echo('Vault revision #' + this.ctx.vault.getDBRevision() + ', ' + this.ctx.vault.getNbEntries() + ' entries.');

        let allEntries = this.ctx.vault.getAllEntries();
        let hiddenResults: IVaultDBEntry[] = [];

        // hide results that have hidden=true, except if explicitely told to show them
        if (!showHiddenEntries) {
            hiddenResults = allEntries.filter((e) => e.hidden);
            allEntries = allEntries.filter((e) => !e.hidden);
        }

        const vef = new VaultEntryFormatter(this.config);
        const html = vef.formatAndHighlightBatch(allEntries);

        if (!html.isEmpty()) {
            this.shell.echoHTML(html);
        }

        if (hiddenResults.length > 0) {
            this.shell.echoHTML(vef.formatAndHighlightBatchFolded(hiddenResults));
        }
    }
}
