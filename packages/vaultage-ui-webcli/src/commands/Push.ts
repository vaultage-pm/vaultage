import { Context } from '../Context';
import { html } from '../security/xss';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class PushCommand implements ICommand {
    public readonly name = 'push';

    public readonly description = 'Pushes an encrypted version of the local db to the server. Does not erase if not fast-forward.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        this.shell.echo(`Attempting to push the encrypted database ...`);

        if (this.ctx.vault.isInDemoMode()) {
            this.shell.echoHTML(html`<span class="warning">[warning] This vault is is <b>demo-mode</b>: "push/pull" have no effect, your session exist only locally. </span>`);
        }

        // we keep this message so the user can see what would be the interaction with the UI.
        await this.ctx.vault.save();
        this.shell.echo('Push OK, revision ' + this.ctx.vault.getDBRevision() + '.');
    }
}
