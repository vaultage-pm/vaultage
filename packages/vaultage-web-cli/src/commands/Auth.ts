import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

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
            // return new Promise(resolve => setTimeout(resolve, 2000));
            const username = await this.shell.prompt('Username:');
            const masterpwd = await this.shell.promptSecret('Password:');

            this.shell.echo(`Attempting to login ${username}@${this.serverUrl}...`);

            let p = new Promise(resolve => this.vault.auth(this.serverUrl, username, masterpwd, function(err) {
                if(err == null){
                    resolve("OK.")
                } else {
                    resolve('<span class="error">'+err.toString()+'</span>')
                }
            }));

            await p;
            p.then((s : string) => this.shell.echoHTML(s))

        } catch (e) {
            // We could get here for instance if the user sends the ^C control sequence to the terminal
            this.shell.echo('Failed.');
        }
    }
}
