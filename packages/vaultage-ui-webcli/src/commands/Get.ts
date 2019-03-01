import { IVaultDBEntry } from 'vaultage-client/dist/src/vaultage';
import { Config } from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class GetCommand implements ICommand {
    public readonly name = 'get';

    public readonly description = 'Get [keyword1] [keyword2] ... searches for keyword1 or keyword2 in all entries. Add --hidden to show hidden results.';

    constructor(
        private shell: Shell,
        private config: Config,
        private ctx: Context) {
    }

    public async handle(searchTerms: string[]) {

        if (searchTerms.length === 0) {
            this.shell.echoHTML(html`Usage: get <i>term1</i> <i>[term2]</i>... (use \'ls\' to list all entries).`);
            return;
        }

        // flag to show all results
        const showHiddenResults = searchTerms.some((s) => s === '--hidden');
        searchTerms = searchTerms.filter((s) => s !== '--hidden');

        // perform the search
        let results = this.ctx.vault.findEntries(...searchTerms);
        let hiddenResults: IVaultDBEntry[] = [];

        // hide results that have hidden=true, except if explicitely told to show them
        if (!showHiddenResults) {
            hiddenResults = results.filter((e) => e.hidden);
            results = results.filter((e) => !e.hidden);
        }

        // check if we truncate the search results
        if (this.config.showAtMostNResults !== -1 && this.config.showAtMostNResults < results.length) {
            hiddenResults = hiddenResults.concat(results.slice(this.config.showAtMostNResults));
            results = results.slice(0, this.config.showAtMostNResults);
        }

        const vef = new VaultEntryFormatter(this.config);

        const coloredSearchString = vef.searchTermsToHighlightedString(searchTerms);
        this.shell.echoHTML(html`Searching for ${coloredSearchString}, ${results.length} matching entries.`);
        this.shell.echoHTML(vef.formatAndHighlightBatch(results, searchTerms));

        if (hiddenResults.length > 0) {
            this.shell.echoHTML(vef.formatAndHighlightBatchFolded(hiddenResults, searchTerms));
        }
    }
}
