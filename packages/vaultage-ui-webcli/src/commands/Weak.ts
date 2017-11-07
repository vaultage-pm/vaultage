import { PasswordStrength } from 'vaultage-client';
import { VaultEntryFormatter } from '../VaultEntryFormatter'
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class WeakCommand implements ICommand {
    public readonly name = 'weak';

    public readonly description = 'Lists all the weak passwords';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {

        console.log(this.vault);
        
        if(!this.vault.isAuth()){
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED)
            return;
        }

        try {
            let results = this.vault.getWeakPasswords(PasswordStrength.MEDIUM)        
            this.shell.echoHTML('Searching for entries with a weak password, '+results.length+' matching entries.');
            this.shell.echoHTML(VaultEntryFormatter.formatBatch(results));

        } catch (e) {
            this.shell.echoHTML('<span class="error">Failed. ' + e.toString()+'</span>');        
        }
    }
}