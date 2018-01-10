import { PasswordStrength } from 'vaultage-client';

import { Global } from '../Global';
import * as lang from '../lang';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class WeakCommand implements ICommand {
    public readonly name = 'weak';

    public readonly description = 'Lists all the weak passwords';

    constructor(
        private shell: Shell) {
    }

    public async handle() {

        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        const results = Global.vault.getWeakPasswords(PasswordStrength.MEDIUM);
        this.shell.echoHTML('Searching for entries with a weak password, ' + results.length + ' matching entries.');
        this.shell.echoHTML(VaultEntryFormatter.formatBatch(results));
        this.shell.separator();
    }
}
