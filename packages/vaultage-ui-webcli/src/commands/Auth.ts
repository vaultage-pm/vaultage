import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as config from '../../config';

export class AuthCommand implements ICommand {
    public readonly name = 'auth';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    private defaultURL;

    constructor(
            private vault: Vault,
            private shell: Shell) {
        this.defaultURL = location.protocol+'//'+location.hostname+(location.port?":"+location.port:"")+location.pathname;
    }

    public async handle(args: string[]) {
        const serverUrl = args.length > 0 ? args[0] : this.defaultURL;
        try {

            let username = await this.shell.prompt('Username:', config.DEFAULT_USER);
            let masterpwd = await this.shell.promptSecret('Password:');
            
            this.shell.echo(`Attempting to login ${username}@${this.defaultURL}...`);

            await new Promise((_resolve, reject) => 
                this.vault.auth(serverUrl, username, masterpwd, reject)
            );

            this.shell.echo("Pull OK, got " + this.vault.getNbEntries()+" entries (revision "+this.vault.getDBRevision()+").")
        } catch (err) {
            this.shell.echoError(err.toString());
        }
    }
}
