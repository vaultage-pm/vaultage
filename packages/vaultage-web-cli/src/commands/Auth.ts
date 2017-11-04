import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as config from '../../config';

export class AuthCommand implements ICommand {
    public readonly name = 'auth';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    constructor(
        private vault: Vault,
        private shell: Shell,
        private serverUrl: string) {
    }

    public async handle() {
        try {

            let username = await this.shell.prompt('Username:', config.DEFAULT_USER);
            let masterpwd = await this.shell.promptSecret('Password:');
            
            this.shell.echo(`Attempting to login ${username}@${this.serverUrl}...`);

            let p = new Promise(resolve => this.vault.auth(this.serverUrl, username, masterpwd, function(err) {
                if(err == null){
                    resolve("")
                } else {
                    resolve('<span class="error">'+err.toString()+'</span>')
                }
            }));

            await p;
            p.then((err : string) => {
                //if no error
                if(err=="") {
                    this.shell.echo("Pull OK, got " + this.vault.getNbEntries()+" entries (revision "+this.vault.getDBRevision()+").")
                } else {
                    this.shell.echoHTML(err)
                }      
            })

        } catch (e) {
            this.shell.echoHTML('<span class="error">Failed. ' + e.toString()+'</span>');            
        }
    }
}
