import { IVaultDBEntry } from 'vaultage-client';

import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';


export class RawImportCommand implements ICommand {
    public readonly name = 'rawimport';

    public readonly description = 'If authenticated, tries to replaces the whole database with the provided JSON, then push the encryption of the new local db.';

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        const json = await this.shell.prompt('JSON:');
        const entries: IVaultDBEntry[] = JSON.parse(json);
        this.ctx.vault.replaceAllEntries(entries); // can throw exceptions on malformed input
        this.shell.echoHTML('Import successful, db now contains ' + this.ctx.vault.getNbEntries() + '. <b>It has not been pushed</b>, ' +
            'please explore the data with <i>get</i>, then <i>push</i> to confirm or <i>pull</i> to abort this import.');
        this.shell.separator();
    }
}
