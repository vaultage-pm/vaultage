import { IVaultDBEntryAttrs } from 'vaultage-client';
import { Vault } from 'vaultage-client';
import { ConcreteRandomnessGenerator, IRandomness, Passwords } from 'vaultage-client';

import * as config from '../Config';
import * as lang from '../lang';
import { VaultEntryFormatter } from '../VaultEntryFormatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class RotateCommand implements ICommand {
    public readonly name = 'rotate';

    public readonly description = 'Re-generates a new password for an entry in the local db, then pushes an encrypted version of the db to the server.';

    constructor(
        private shell: Shell) {
    }

    public async handle(args: string[]) {

        if (!this.vault.isAuth()) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        let id: string;
        if (args.length === 0) {
            id = await this.shell.prompt('Entry ID:');
        } else {
            id = args[0];
        }

        const entry = this.vault.getEntry(id);

        const rnd: IRandomness = new ConcreteRandomnessGenerator();
        const pwdGen = new Passwords(rnd);
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

        this.vault.updateEntry(id, newEntry);

        this.shell.echoHTML('Entry #' + id + ' was :');
        this.shell.echoHTML(VaultEntryFormatter.formatSingle(entry));
        this.shell.echoHTML('Entry #' + id + ' now is :');
        const entry2 = this.vault.getEntry(id);
        this.shell.echoHTML(VaultEntryFormatter.formatSingle(entry2));

        await new Promise((resolve, reject) => this.vault.save((err) => {
            if (err == null) {
                resolve();
            } else {
                reject(err);
            }
        }));

        this.shell.echo('Push OK, revision ' + this.vault.getDBRevision() + '.');
        this.shell.separator();
    }
}
