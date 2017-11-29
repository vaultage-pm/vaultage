import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LsCommand implements ICommand {
    public readonly name = 'ls';

    public readonly description = 'If authenticated, lists the vault content.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {

        if (!this.vault.isAuth()) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        this.shell.echo('Vault revision #' + this.vault.getDBRevision() + ', ' + this.vault.getNbEntries() + ' entries.');
        const allEntries = this.vault.getAllEntries();
        this.shell.echoHTML(VaultEntryFormatter.formatBatch(allEntries));
    }
}
