import { Global } from '../Global';
import { Vault } from 'vaultage-client';

import * as lang from '../lang';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LsCommand implements ICommand {
    public readonly name = 'ls';

    public readonly description = 'If authenticated, lists the vault content.';

    constructor(
        private shell: Shell) {
    }

    public async handle() {

        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        this.shell.echo('Vault revision #' + Global.vault.getDBRevision() + ', ' + Global.vault.getNbEntries() + ' entries.');
        const allEntries = Global.vault.getAllEntries();
        const html = VaultEntryFormatter.formatBatch(allEntries);
        if (html !== '') {
            this.shell.echoHTML(html);
        }
        this.shell.separator();
    }
}
