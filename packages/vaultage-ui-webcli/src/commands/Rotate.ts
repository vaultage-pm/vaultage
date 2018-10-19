import { IVaultDBEntryAttrs, Passwords } from 'vaultage-client';
import * as config from '../Config';
import { Context } from '../Context';
import { html } from '../security/xss';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';


export class RotateCommand implements ICommand {
    public readonly name = 'rotate';

    public readonly description = 'Re-generates a new password for an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell,
        private configInstance: config.Config,
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

        const pwdGen = new Passwords();
        const newPassword = pwdGen.generatePassword(
            config.PWD_GEN_LENGTH,
            config.PWD_GEN_USE_SYMBOLS,
            config.PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS,
            config.PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING);

        const newEntry: IVaultDBEntryAttrs = {
            title: entry.title,
            login: entry.login,
            password: newPassword,
            url: entry.url
        };

        this.ctx.vault.updateEntry(id, newEntry);

        if (this.ctx.vault.isInDemoMode()) {
            this.shell.echoHTML(html`<span class="warning">[warning] Typically, this command pushes automatically to the server, but not in <b>demo-mode</b>. Locally, the password has been changed (try "get ${entry.title}") </span>`);
        }
        await this.ctx.vault.save();

        const vef = new VaultEntryFormatter(this.configInstance);

        this.shell.echo('Entry #' + id + ' was :');
        this.shell.echoHTML(vef.formatSingle(entry));
        this.shell.echo('Entry #' + id + ' now is :');
        const entry2 = this.ctx.vault.getEntry(id);
        this.shell.echoHTML(vef.formatSingle(entry2));

        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
