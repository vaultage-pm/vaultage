import { VaultEntryFormatter } from '../VaultFormatter'
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class LsCommand implements ICommand {
    public readonly name = 'ls';

    public readonly description = 'If authenticated, lists the vault content.';

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
            this.shell.echo("Vault revision #"+this.vault.getDBRevision()+", "+this.vault.getNbEntries()+" entries.");
            let allEntries = this.vault.getAllEntries();
            this.shell.echoHTML(VaultEntryFormatter.formatBatch(allEntries));

        } catch (e) {
            this.shell.echoHTML('<span class="error">Failed. ' + e.toString()+'</span>');        
        }
    }
}