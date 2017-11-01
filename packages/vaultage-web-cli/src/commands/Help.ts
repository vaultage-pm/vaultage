import { ICommand } from '../ICommand';
import { Shell } from '../Shell';

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
