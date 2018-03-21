import { Passwords, PasswordStrength } from 'vaultage-client';

import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';


export class PwdCommand implements ICommand {
    public readonly name = 'pwd';

    public readonly description = 'Changes the master passwords, and updates the local encryption key and remote authentication key accordingly.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        const newMasterPassword = await this.shell.promptSecret('New master password          :');
        const newMasterPassword2 = await this.shell.promptSecret('New master password (confirm):');

        if (newMasterPassword !== newMasterPassword2) {
            this.shell.echoError('The two passwords provided are different.');
            return;
        }

        const strength = Passwords.getPasswordStrength(newMasterPassword);

        if (strength === PasswordStrength.WEAK) {
            const answer = await this.shell.promptYesNo(`'WARNING: The provided master password is VERY WEAK. The whole security of this password manager depends on it. Continue anyway?`);
            if (answer !== 'yes') {
                this.shell.echo('Cancelled.');
                return;
            }
        }

        this.shell.echo(`Attempting to change the master password...`);

        await this.ctx.vault.updateMasterPassword(newMasterPassword);

        this.shell.echo('Password change OK (db at revision ' + this.ctx.vault.getDBRevision() + '). Please use the new password from now on.');
    }
}
