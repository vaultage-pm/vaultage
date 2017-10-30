import { ICommand } from '../webshell/ICommand';

export class AsyncCommand implements ICommand {
    public readonly name = 'async';

    public readonly description = 'Demonstrates how to use the terminal with asynchronous commands';

    public handle() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }
}
