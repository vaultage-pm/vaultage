import { IVaultDBEntryAttrs } from 'vaultage-client';
import { Config } from '../Config';
import { Context } from '../Context';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class AddCommand implements ICommand {
    public readonly name = 'add';

    public readonly description = 'Adds an entry to the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell,
        private config: Config,
        private ctx: Context) {
    }

    public async handle() {

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

        const newEntryID = this.ctx.vault.addEntry(newEntry);
        const e = this.ctx.vault.getEntry(newEntryID);
        const vef = new VaultEntryFormatter(this.config);

        this.shell.echoHTML(vef.formatSingle(e));
        this.shell.echo('Added entry #' + newEntryID);

        await this.ctx.vault.save();
        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
