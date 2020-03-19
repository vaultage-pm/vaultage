import { IVaultDBEntryAttrs } from 'vaultage-client';
import { Config } from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class EditCommand implements ICommand {
    public readonly name = 'edit';

    public readonly description = 'Edits an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell,
        private config: Config,
        private ctx: Context) {
    }

    public async handle(args: string[]) {

        let id: string;
        if (args.length === 0) {
            id = await this.shell.prompt('Entry ID:');
        } else {
            id = args[0];
        }

        const entry = this.ctx.vault.getEntry(id);

        const title = await this.shell.prompt('Title:', entry.title);
        const username = await this.shell.prompt('Username:', entry.login);
        const password = await this.shell.prompt('Password:', entry.password);
        const url = await this.shell.prompt('Url:', entry.url);

        const newEntry: IVaultDBEntryAttrs = {
            title: title,
            login: username,
            password: password,
            url: url
        };

        const answer = await this.shell.promptYesNo(html`Confirm edit of entry #${id}?`);
        if (answer !== 'yes') {
            this.shell.echo('Cancelled.');
            return;
        }

        this.ctx.vault.updateEntry(id, newEntry);
        const entry2 = this.ctx.vault.getEntry(id);
        const vef = new VaultEntryFormatter(this.config);
        this.shell.echoHTML(vef.formatSingle(entry2));
        this.shell.echo('Updated entry #' + id);

        await this.ctx.vault.save();

        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
