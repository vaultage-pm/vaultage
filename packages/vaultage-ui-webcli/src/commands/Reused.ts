import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class ReusedCommand implements ICommand {
    public readonly name = 'reused';

    public readonly description = 'Get all the entries that share the same password.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        const results = this.ctx.vault.getEntriesWhichReusePasswords();
        this.shell.echoHTML('Searching for entries with a non-unique password, ' + results.length + ' matching entries.');
        this.shell.echoHTML(VaultEntryFormatter.formatBatch(results));
        this.shell.separator();
    }
}
