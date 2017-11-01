import { ICommand } from '../ICommand';

export class PushCommand implements ICommand {
    public readonly name = 'push';

    public readonly description = 'Pushes the cipher';

    public handle() {
        // noop
    }
}
