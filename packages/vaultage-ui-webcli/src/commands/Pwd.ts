import { Vault } from 'vaultage-client';
import { Passwords, PasswordStrength } from 'vaultage-client';

import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PwdCommand implements ICommand {
    public readonly name = 'pwd';

    public readonly description = 'Changes the master passwords, and updates the local encryption key and remote authentication key accordingly.';

    constructor(
            private vault: Vault,
            private shell: Shell) {
    }

    public async handle() {

        if (!this.vault.isAuth()) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        try {
            const newMasterPassword = await this.shell.promptSecret('New master password          :');
            const newMasterPassword2 = await this.shell.promptSecret('New master password (confirm):');

            if (newMasterPassword !== newMasterPassword2) {
                this.shell.echoError('The two passwords provided are different.');
                return;
            }

            const strength = Passwords.getPasswordStrength(newMasterPassword);
            console.log(strength);

            if (strength === PasswordStrength.WEAK) {
                const answer = await this.shell.prompt('WARNING: The provided master password is VERY WEAK. The whole security of this password manager depends on it. Continue anyway ? [y/N]')

                if (answer !== 'y' && answer !== 'Y') {
                    this.shell.echo('Cancelled.');
                    return;
                }
            }

            this.shell.echo(`Attempting to change the master password...`);

            await new Promise((resolve, reject) => this.vault.updateMasterPassword(newMasterPassword, (err) => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            }));

            this.shell.echo('Password change OK (db at revision ' + this.vault.getDBRevision() + '). Please use the new password from now on.');
        } catch (e) {
            this.shell.echoError(e.toString());
        }
    }
}
