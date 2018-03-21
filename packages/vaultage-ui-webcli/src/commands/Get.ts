import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class GetCommand implements ICommand {
    public readonly name = 'get';

    public readonly description = 'Get [keyword1] [keyword2] ... searches for keyword1 or keyword2 in all entries.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle(searchTerms: string[]) {

        if (searchTerms.length === 0) {
            this.shell.echoHTML('Usage: get <i>term1</i> <i>[term2]</i>... (use \'ls\' to list all entries).');
            return;
        }

        const results = this.ctx.vault.findEntries(...searchTerms);
        const coloredSearchString = VaultEntryFormatter.searchTermsToHighlightedString(searchTerms);
        this.shell.echoHTML('Searching for ' + coloredSearchString + ', ' + results.length + ' matching entries.');
        this.shell.echoHTML(VaultEntryFormatter.formatAndHighlightBatch(results, searchTerms));
    }
}
