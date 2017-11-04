import { VaultDBEntryAttrs } from 'vaultage-client';
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import { VaultEntryFormatter } from '../VaultFormatter'
import * as lang from '../lang';

export class EditCommand implements ICommand {
    public readonly name = 'edit';

    public readonly description = 'Edits an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle(args: string[]) {

        if(!this.vault.isAuth()){
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED)
            return;
        }

        try {
            let id : string;
            if(args.length == 0) {
                id = await this.shell.prompt('Entry ID:');
            } else {
                id = args[0];
            }

            const entry = this.vault.getEntry(id)

            const title = await this.shell.prompt('Title:', entry.title);
            const username = await this.shell.prompt('Username:', entry.login);
            const password = await this.shell.prompt('Password:', entry.password);
            const url = await this.shell.prompt('Url:', entry.url);

            const newEntry : VaultDBEntryAttrs = {
                title: title,
                login: username,
                password: password,
                url: url
            }

            const answer = await this.shell.prompt('Confirm edit of entry #'+id+' ? y/Y')
            
            if(answer != "y" && answer != "Y"){
                this.shell.echo("Cancelled.")
                return
            }

            this.vault.updateEntry(id, newEntry)
            const entry2 = this.vault.getEntry(id)
            this.shell.echoHTML(VaultEntryFormatter.formatSingle(entry2))
            this.shell.echo("Updated entry #"+id)

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
            this.shell.echoHTML('<span class="error">Failed. ' + e.toString()+'</span>');            
        }
    }
}
