import { Formatter } from './Formatter';
import { ICommand } from './ICommand';
import { ICommandHandler, ICompletionResponse, Terminal } from './terminal/Terminal';

export class Shell implements ICommandHandler {

    private commands: {
        [key: string]: ICommand
    } = {};

    constructor(
            private terminal?: Terminal) {
        if (terminal) {
            this.attach(terminal);
        }
    }

    public echo(value: string) {
        this.safeGetTerminal().print(value);
    }

    public prompt(question: string): Promise<string> {
        return this.unbusyAction((term) => new Promise(resolve => {
            const oldPrompt = term.prompt;
            term.prompt = question + '&nbsp;';
            term.setHandler({
                onCommand: (line) => {
                    resolve(line);
                    term.prompt = oldPrompt;
                    term.setHandler(this);
                }
            });
        }));
    }

    public promptSecret(question: string): Promise<string> {
        return this.unbusyAction((term) => new Promise(resolve => {
            const oldPrompt = term.prompt;
            term.enterSecretMode();
            term.prompt = question + '&nbsp;';
            term.setHandler({
                onCommand: (line) => {
                    term.prompt = oldPrompt;
                    term.setHandler(this);
                    term.exitSecretMode();
                    resolve(line);
                }
            });
        }));
    }

    /**
     * Executes an action outside of busy mode, restoring busy mode afterwards if necessary
     */
    private unbusyAction<T>(cb: (term: Terminal) => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            setImmediate(async () => {
                const term = this.safeGetTerminal();
                const wasBusy = term.isBusy;
                if (wasBusy) {
                    term.exitBusyMode();
                }
                function restore() {
                    if (wasBusy) {
                        term.enterBusyMode();
                    }
                }
                try {
                    const ret = await cb(term);
                    restore();
                    resolve(ret);
                } catch (e) {
                    restore();
                    reject(e);
                }
            });
        });
    }

    public echoHTML(value: string) {
        this.safeGetTerminal().print(value, { unsafe_i_know_what_i_am_doing: true });
    }

    public addCommand(cmd: ICommand): void {
        this.commands[cmd.name] = cmd;
    }

    public attach(terminal: Terminal) {
        this.terminal = terminal;
        this.terminal.setHandler(this);
    }

    public printHelp(): void {
        const availableCommands = `Available commands:<br>
        ${ Object.keys(this.commands)
            .map(c => Formatter.format('- <b>%</b> :&#9;%', ...[c, this.commands[c].description]))
            .join('<br>')
        }`;
        this.safeGetTerminal().print(availableCommands, { unsafe_i_know_what_i_am_doing: true });
    }

    public onCommand(command: string): void | Promise<void> {
        const terminal = this.safeGetTerminal();
        const parts = command.split(' ');
        const handler = this.commands[parts[0]];
        if (handler == null) {
            terminal.print('unknow command "' + parts[0] + '"');
            this.printHelp();
            return;
        }
        const result = handler.handle(parts.slice(1));
        if (result && result.then) {
            terminal.enterBusyMode();
            result.then(
                () => terminal.exitBusyMode(),
                () => terminal.exitBusyMode()
            );
        }
    }

    public onCompletionRequest(line: string, pos: number): ICompletionResponse | null {
        // For now just complete the command to demo the interface
        const matchCmd = line.match(/^(\s*\S+)(\s?.*)$/);
        if (matchCmd) {
            const firstWord = matchCmd[1];
            const restOfCommand = matchCmd[2];
            if (pos <= firstWord.length) {
                // We can autocomplete the first word at that point
                const toMatch = firstWord.trim();
                const matching = Object.keys(this.commands).filter(k => k.startsWith(toMatch));
                if (matching.length === 1) {
                    return {
                        line: matching[0] + ' ' + restOfCommand,
                        pos: matching[0].length + 1
                    };
                } else if (matching.length > 1) {
                    this.safeGetTerminal().printCurrentPrompt();
                    this.safeGetTerminal().print(matching
                            .map(k => Formatter.format('<b>%</b>', k))
                            .join('&#9;')
                        , { unsafe_i_know_what_i_am_doing: true });
                }
            }
        }
        return null;
    }

    public safeGetTerminal(): Terminal {
        if (this.terminal == null) {
            throw new Error('This shell is not attached!');
        }
        return this.terminal;
    }
}