import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class DumpCommand implements ICommand {
    public readonly name = 'dump';

    public readonly description = 'Dumps the plaintext of the database in JSON. *store with caution*';

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
            let allEntries = this.vault.getAllEntries();
            this.shell.echoHTML('var entries=\''+JSON.stringify(allEntries)+'\'');
        } catch (e) {
            this.shell.echoError(e.toString());       
        }
    }
}