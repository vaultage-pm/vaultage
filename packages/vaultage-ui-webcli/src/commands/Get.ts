import { VaultEntryFormatter } from '../VaultEntryFormatter'
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class GetCommand implements ICommand {
    public readonly name = 'get';

    public readonly description = 'Get [keyword1] [keyword2] ... searches for keyword1 or keyword2 in all entries.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle(searchTerms : string[]) {

        if(!this.vault.isAuth()){
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED)
            return;
        }

        if(searchTerms.length == 0){
            this.shell.echoHTML('Usage: get <i>term1</i> <i>[term2]</i>... (use \'ls\' to list all entries).');
            return;
        }

        try {
            const results = this.vault.findEntries(...searchTerms)
            const coloredSearchString = VaultEntryFormatter.searchTermsToHighlightedString(searchTerms)
            this.shell.echoHTML('Searching for '+coloredSearchString+', '+results.length+' matching entries.');
            this.shell.echoHTML(VaultEntryFormatter.formatAndHighlightBatch(results, searchTerms));

        } catch (e) {
            this.shell.echoError(e.toString());     
        }
    }
}