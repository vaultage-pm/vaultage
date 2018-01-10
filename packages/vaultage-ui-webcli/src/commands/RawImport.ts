import { Global } from '../Global';
import { IVaultDBEntry } from 'vaultage-client';
import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class RawImportCommand implements ICommand {
    public readonly name = 'rawimport';

    public readonly description = 'If authenticated, tries to replaces the whole database with the provided JSON, then push the encryption of the new local db.';

    constructor(
        private shell: Shell) {
    }

    public async handle() {

        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        const json = await this.shell.prompt('JSON:');
        const entries: IVaultDBEntry[] = JSON.parse(json);
        Global.vault.replaceAllEntries(entries); // can throw exceptions on malformed input
        this.shell.echoHTML('Import successful, db now contains ' + Global.vault.getNbEntries() + '. <b>It has not been pushed</b>, ' +
            'please explore the data with <i>get</i>, then <i>push</i> to confirm or <i>pull</i> to abort this import.');
        this.shell.separator();
    }
}
