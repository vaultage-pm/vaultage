import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class ClearCommand implements ICommand {
    public readonly name = 'clear';

    public readonly description = 'Clears the current screen.';

    constructor(
        private shell: Shell) {
    }

    public async handle() {
        this.shell.clearLog();
        this.shell.printBanner();
    }
}
