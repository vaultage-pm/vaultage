import { Config } from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class GetCommand implements ICommand {
    public readonly name = 'get';

    public readonly description = 'Get [keyword1] [keyword2] ... searches for keyword1 or keyword2 in all entries.';

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

        const results = this.ctx.vault.findEntries(...searchTerms);
        const vef = new VaultEntryFormatter(this.config);

        const coloredSearchString = vef.searchTermsToHighlightedString(searchTerms);
        this.shell.echoHTML(html`Searching for ${coloredSearchString}, ${results.length} matching entries.`);
        this.shell.echoHTML(vef.formatAndHighlightBatch(results, searchTerms));
    }
}
