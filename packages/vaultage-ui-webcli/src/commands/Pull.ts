import { Global } from '../Global';
import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Pulls the encrypted database, and decrypts it locally.';

    constructor(
        private shell: Shell) {
    }

    public async handle() {
        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        this.shell.echo(`Attempting to pull the encrypted database ...`);

        await Global.vault.pull();

        this.shell.echo('Pull OK, got ' + Global.vault.getNbEntries() + ' entries (revision ' + Global.vault.getDBRevision() + ').');
        this.shell.separator();
    }
}
