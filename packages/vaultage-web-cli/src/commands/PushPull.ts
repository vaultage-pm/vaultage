import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Logs in to the remote server, pulls the encrypted database, and decrypts it.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        try {
            
            this.shell.echo(`Attempting to pull the encrypted database ...`);

            let p = new Promise(resolve => this.vault.pull(function(err) {
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
                    this.shell.echo("Pull OK, got " + this.vault.getNbEntries()+" entries.")
                } else {
                    this.shell.echoHTML(err)
                }                
            })

        } catch (e) {
            // We could get here for instance if the user sends the ^C control sequence to the terminal
            this.shell.echo('Failed.');
        }
    }
}


export class PushCommand implements ICommand {
    public readonly name = 'push';

    public readonly description = 'Logs in to the remote server, and pushes an encrypted version of the local db';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        try {
            this.shell.echo(`Attempting to push the encrypted database ...`);

            let p = new Promise(resolve => this.vault.save(function(err) {
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
                    this.shell.echo("Push OK, when from ??? to " + this.vault.getNbEntries()+" entries.")
                } else {
                    this.shell.echoHTML(err)
                }                
            })

        } catch (e) {
            // We could get here for instance if the user sends the ^C control sequence to the terminal
            this.shell.echo('Failed.');
        }
    }
}
