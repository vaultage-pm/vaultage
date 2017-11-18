import { IVaultDBEntry } from 'vaultage-client';
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class RawImportCommand implements ICommand {
    public readonly name = 'rawimport';

    public readonly description = 'If authenticated, tries to replaces the whole database with the provided JSON, then push the encryption of the new local db.';

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

            const json = await this.shell.prompt('JSON:');
            const entries : IVaultDBEntry[] = JSON.parse(json);
            this.vault.replaceAllEntries(entries); // can throw exceptions on malformed input
            this.shell.echoHTML("Import successful, db now contains " + this.vault.getNbEntries()+". <b>It has not been pushed</b>, "+
                "please explore the data with <i>get</i>, then <i>push</i> to confirm or <i>pull</i> to abort this import.")            

        } catch (e) {
            this.shell.echoError(e.toString());       
        }
    }
}
