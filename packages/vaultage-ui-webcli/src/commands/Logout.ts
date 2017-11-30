import { Vault } from 'vaultage-client';

import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LogoutCommand implements ICommand {
    public readonly name = 'logout';

    public readonly description = 'Clears all local sensitive information.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        this.vault.unauth();
        this.shell.echo('Logout OK.');
        this.shell.separator();
    }
}
