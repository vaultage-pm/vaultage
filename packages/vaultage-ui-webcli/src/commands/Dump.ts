import { Global } from '../Global';
import * as lang from '../lang';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class DumpCommand implements ICommand {
    public readonly name = 'dump';

    public readonly description = 'Dumps the plaintext of the database in JSON. *store with caution*';

    constructor(
        private shell: Shell) {
    }

    public async handle() {

        if (!Global.vault) {
            this.shell.echoHTML(lang.ERR_NOT_AUTHENTICATED);
            return;
        }

        const allEntries = Global.vault.getAllEntries();
        this.shell.echoHTML(JSON.stringify(allEntries));
        this.shell.separator();
    }
}
