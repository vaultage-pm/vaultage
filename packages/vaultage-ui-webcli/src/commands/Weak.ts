import { PasswordStrength } from 'vaultage-client';

import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class WeakCommand implements ICommand {
    public readonly name = 'weak';

    public readonly description = 'Lists all the weak passwords';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        const results = this.ctx.vault.getWeakPasswords(PasswordStrength.MEDIUM);
        this.shell.echoHTML('Searching for entries with a weak password, ' + results.length + ' matching entries.');
        this.shell.echoHTML(VaultEntryFormatter.formatBatch(results));
        this.shell.separator();
    }
}
