import { PasswordStrength } from 'vaultage-client';

import { Config } from '../Config';
import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class WeakCommand implements ICommand {
    public readonly name = 'weak';

    public readonly description = 'Lists all the weak passwords';

    constructor(
        private shell: Shell,
        private config: Config,
        private ctx: Context) {
    }

    public async handle() {
        const results = this.ctx.vault.getWeakPasswords(PasswordStrength.MEDIUM);
        this.shell.echo('Searching for entries with a weak password, ' + results.length + ' matching entries.');

        const vef = new VaultEntryFormatter(this.config);
        this.shell.echoHTML(vef.formatAndHighlightBatch(results));
    }
}
