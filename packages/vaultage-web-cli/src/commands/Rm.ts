import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import { VaultEntryFormatter } from '../VaultFormatter'
import * as lang from '../lang';

export class RmCommand implements ICommand {
    public readonly name = 'rm';

    public readonly description = 'Removes an entry in the local db, then pushes an encrypted version of the db to the server.';

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

            const id = await this.shell.prompt('Entry ID:');
            const e = this.vault.getEntry(id)
            this.shell.echoHTML(VaultEntryFormatter.format(e))

            const answer = await this.shell.prompt('Confirm removal of entry #'+id+' ? y/Y')
            
            if(answer != "y" && answer != "Y"){
                this.shell.echo("Cancelled.")
                return
            }
            
            this.vault.removeEntry(id)
            this.shell.echo("Remove entry #"+id)

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
                    this.shell.echo("Push OK, revision " + this.vault.getDBRevision()+".")
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
