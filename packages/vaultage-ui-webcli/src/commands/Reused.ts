import { VaultEntryFormatter } from '../VaultEntryFormatter'
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class ReusedCommand implements ICommand {
    public readonly name = 'reused';

    public readonly description = 'Get all the entries that share the same password.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {

        if(!this.vault.isAuth()){
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED)
            return;
        }

        try {
            const results = this.vault.getEntriesWhichReusePasswords()
            this.shell.echoHTML('Searching for entries with a non-unique password, '+results.length+' matching entries.');
            this.shell.echoHTML(VaultEntryFormatter.formatBatch(results));

        } catch (e) {
            this.shell.echoError(e.toString());      
        }
    }
}