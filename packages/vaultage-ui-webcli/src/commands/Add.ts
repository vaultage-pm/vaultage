import { IVaultDBEntryAttrs } from 'vaultage-client';
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import { VaultEntryFormatter } from '../VaultEntryFormatter'
import * as lang from '../lang';

export class AddCommand implements ICommand {
    public readonly name = 'add';

    public readonly description = 'Adds an entry to the local db, then pushes an encrypted version of the db to the server.';

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

            const title = await this.shell.prompt('Title:');
            const username = await this.shell.prompt('Username:');
            const password = await this.shell.prompt('Password:');
            const url = await this.shell.prompt('Url:');

            const newEntry : IVaultDBEntryAttrs = {
                title: title,
                login: username,
                password: password,
                url: url
            }

            const newEntryID = this.vault.addEntry(newEntry)
            const e = this.vault.getEntry(newEntryID)
            this.shell.echoHTML(VaultEntryFormatter.formatSingle(e))
            this.shell.echo("Added entry #"+newEntryID)

            await new Promise((resolve, reject) => this.vault.save(function(err) {
                if(err == null){
                    resolve()
                } else {
                    reject(err)
                }
            }));

            this.shell.echo("Push OK, revision " + this.vault.getDBRevision()+".")

        } catch (e) {
            this.shell.echoError(e.toString());           
        }
    }
}
