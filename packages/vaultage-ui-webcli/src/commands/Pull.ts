import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import { Config } from '../Config';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Pulls the encrypted database, and decrypts it locally. If local contents differ, attempts to merge automatically. Use --replace to simply keep the server\'s version';

    constructor(
        private shell: Shell,
        private ctx: Context,
        private config: Config) {
    }

    public async handle(params: string[]) {

        if (!this.config.autoMerge || (params.length === 1 && params[0] === '--replace')) {
            this.shell.echo(`Attempting to pull & replace the encrypted database ...`);

            const tryMerge = false;
            await this.ctx.vault.pull(tryMerge);

            this.shell.echo('Pull OK, got ' + this.ctx.vault.getNbEntries() + ' entries (revision ' + this.ctx.vault.getDBRevision() + ').');
        } else {
            this.shell.echo(`Attempting to pull & merge the encrypted database ...`);

            const tryMerge = true;
            const log = await this.ctx.vault.pull(tryMerge);

            if (log !== '' && !log.startsWith('Nothing To Merge: ')) {
                this.shell.echoMergeReport(log);
                this.shell.echo('Merge OK, got ' + this.ctx.vault.getNbEntries() + ' entries (revision ' + this.ctx.vault.getDBRevision() + '). Push if this looks good, or "pull --replace" to get the server version.');
            } else {
                this.shell.echo('Pull OK, got ' + this.ctx.vault.getNbEntries() + ' entries (revision ' + this.ctx.vault.getDBRevision() + ').');
            }
        }
    }
}
