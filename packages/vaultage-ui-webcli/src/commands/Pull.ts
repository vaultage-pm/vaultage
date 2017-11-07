import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Pulls the encrypted database, and decrypts it locally.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        if(!this.vault.isAuth()){
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED)
            return;
        }

        try {
            this.shell.echo(`Attempting to pull the encrypted database ...`);

            await new Promise((_resolve, reject) => this.vault.pull(reject));

            this.shell.echo("Pull OK, got " + this.vault.getNbEntries()+" entries (revision "+this.vault.getDBRevision()+").")
        } catch (e) {
            this.shell.echoError(e.toString());
        }
    }
}