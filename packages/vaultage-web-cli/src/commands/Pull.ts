import { ICommand } from '../ICommand';

export class PullCommand implements ICommand {
    public readonly name = 'pull';

    public readonly description = 'Pulls the cipher';

    public handle() {
        // noop
    }
}
