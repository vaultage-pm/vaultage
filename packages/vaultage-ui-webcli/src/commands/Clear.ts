import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class ClearCommand implements ICommand {
    public readonly name = 'clear';

    public readonly description = 'Clears the current screen.';

    constructor(
        private version: string,
        private shell: Shell) {
    }

    public async handle() {
        this.shell.clearLog();

        this.shell.echoHTML('   Vaultage v' + this.version);
        this.shell.echoHTML('*********************');
        this.shell.printShortHelp();
        this.shell.echoHTML('*********************');

    }
}
