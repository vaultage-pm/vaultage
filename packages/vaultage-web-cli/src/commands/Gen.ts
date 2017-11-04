import { VaultDBEntryAttrs } from 'vaultage-client';
import { Vault } from 'vaultage-client';
import { Passwords } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as lang from '../lang';
import * as config from '../../../config';

export class GenCommand implements ICommand {
    public readonly name = 'gen';

    public readonly description = 'Generates a new strong password, and adds an entry to the local db. Then, pushes an encrypted version of the db to the server.';

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

            const pwdGen = new Passwords()
            const password = pwdGen.generatePassword(
                config.PWD_GEN_LENGTH,
                config.PWD_GEN_USE_SYMBOLS,
                config.PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS,
                config.PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING)

            const title = await this.shell.prompt('Title:');
            const username = await this.shell.prompt('Username:');
            const url = await this.shell.promptSecret('Url:');

            const newEntry : VaultDBEntryAttrs = {
                title: title,
                login: username,
                password: password,
                url: url
            }

            const newEntryID = this.vault.addEntry(newEntry)
            this.shell.echoHTML(`Added entry #${newEntryID}, generated password is <span class="blurred">${password}</span>`)

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
