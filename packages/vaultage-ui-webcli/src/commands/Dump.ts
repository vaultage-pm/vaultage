import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class DumpCommand implements ICommand {
    public readonly name = 'dump';

    public readonly description = 'Dumps the plaintext of the database in JSON. *store with caution*';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {

        if (!this.vault.isAuth()) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        const allEntries = this.vault.getAllEntries();
        this.shell.echoHTML('var entries=\'' + JSON.stringify(allEntries) + '\'');
    }
}