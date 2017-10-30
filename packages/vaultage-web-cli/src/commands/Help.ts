import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class HelpCommand implements ICommand {
    public readonly name = 'help';

    public readonly description = 'prints this help message';

    constructor(
            private shell: Shell) {
    }

    public handle() {
        this.shell.printHelp();
    }
}
