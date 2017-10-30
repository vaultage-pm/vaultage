import { Formatter } from '../webshell/Formatter';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class ProcessCommand implements ICommand {
    public readonly name = 'process';

    public readonly description = 'Demonstrates how to do an interactive process';

    constructor(
            private shell: Shell) {
    }

    public async handle() {
        try {
            const name = await this.shell.prompt('What is your name?');
            const pwd = await this.shell.promptSecret('Enter a password:');

            this.shell.echo(`Hello ${name}! Computing your hash for password ${pwd}...`);

            await this.doSomeLongProcessing();

            this.shell.echo('Done.');
            this.shell.echoHTML('You have 1000 &#9733;');
        } catch (e) {
            // We could get here for instance if the user sends the ^C control sequence to the terminal
            this.shell.echoHTML(Formatter.format('<span class="error">%</span>', e.toString()));
        }
    }

    private doSomeLongProcessing(): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

}
