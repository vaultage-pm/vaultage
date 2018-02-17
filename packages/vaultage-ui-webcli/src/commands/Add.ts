import { IVaultDBEntryAttrs } from 'vaultage-client';

import { Global } from '../Global';
import * as lang from '../lang';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class AddCommand implements ICommand {
    public readonly name = 'add';

    public readonly description = 'Adds an entry to the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell) {
    }

    public async handle() {
        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        const title = await this.shell.prompt('Title:');
        const username = await this.shell.prompt('Username:');
        const password = await this.shell.prompt('Password:');
        const url = await this.shell.prompt('Url:');

        const newEntry: IVaultDBEntryAttrs = {
            title: title,
            login: username,
            password: password,
            url: url
        };

        const newEntryID = Global.vault.addEntry(newEntry);
        const e = Global.vault.getEntry(newEntryID);
        this.shell.echoHTML(VaultEntryFormatter.formatSingle(e));
        this.shell.echo('Added entry #' + newEntryID);

        await Global.vault.save();
        this.shell.echo('Push OK, revision ' + Global.vault.getDBRevision() + '.');
        this.shell.separator();
    }
}
