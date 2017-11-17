import { BusyIndicator } from './BusyIndicator';
import { Formatter } from './Formatter';
import { ICommand } from './ICommand';
import { History } from './History';
import { ICommandHandler, ICompletionResponse, Terminal } from './Terminal';

/**
 * Simple web shell inspired by linux terminals.
 *
 * This shell builds upon `Terminal` to create an interactive user experience à la linux shell.
 *
 * A promise-based API allows simple scripts to be written against the shell. Of course those scripts
 * only need to interact with the shell for I/O purposes and the rest is handled in plain JS.
 * 
 * The shell works as a dictionnary of commands. Each command is implemented through the interface
 * ICommand and registered in a shell using `registerCommand`
 * 
 * Features:
 *  - Command registration and input parameters parsing
 *  - Automatic help text generation
 *  - Basic command name autocompletion (TODO: advanced per-command autocompletion)
 *  - Nice handling of asynchronous tasks
 *  - Text and password prompting
 *  - Partial support for the ^C control sequence. (when in a `prompt` action)
 */
export class Shell implements ICommandHandler {

    private commands: {
        [key: string]: ICommand
    } = {};

    private history: History = new History();

    private busyIndicator: BusyIndicator | null = null;

    private defaultPrompt = '>&nbsp;';

    private promptResolve: ((val: Promise<string>) => void) | null = null;

    constructor(
            private terminal?: Terminal) {
        if (terminal) {
            this.attach(terminal);
        }
    }

    /**
     * Appends some text to the console.
     *
     * @param value text to show
     */
    public echo(value: string) {
        this.safeGetTerminal().print(value);
    }

    /**
     * Appends some error text to the console.
     *
     * @param value error text to show
     */
    public echoError(value: string) {
        // cleans encapsulated errors
        while (value.startsWith('Error: Error: ')) {
            value = value.substring(7);
        }

        this.safeGetTerminal().print(
            Formatter.format('<span class="error">%</span>', value),
            { unsafe_i_know_what_i_am_doing: true }
        );
    }

    /**
     * Appends a raw HTML string to the console.
     *
     * Double check for XSS when using this function!
     * Preferably always use this in conjunction with a formatter/escaper.
     *
     * @param value properly escaped HTML string
     */
    public echoHTML(value: string) {
        this.safeGetTerminal().print(value, { unsafe_i_know_what_i_am_doing: true });
    }

    /**
     * Ask the user for a value and return the result as a promise.
     *
     * The promise may fail if the user decides to abort input (using ^C or ESC for instance)
     *
     * usage:
     * 
     * const answer = shell.prompt('What is the answer to life?');
     *
     * @param question Text shown left to the user input
     */
    public prompt(question: string, defaultValue?: string): Promise<string> {
        return this.unbusyAction((term) => new Promise(resolve => {
            term.prompt = question + '&nbsp;';

            if(defaultValue !== undefined){
                term.promptInput = defaultValue;
            }
            this.promptResolve = resolve;
        }));
    }

    /**
     * Same as `prompt` but turns the user input into a password type field thus hiding
     * the actual user input.
     *
     * @param question Text shown left to the user input
     */
    public promptSecret(question: string): Promise<string> {
        return this.unbusyAction((term) => new Promise(resolve => {
            term.secretMode = true;
            term.prompt = question + '&nbsp;';
            this.promptResolve = resolve;
        }));
    }

    /**
     * Adds a command so that it can be called within this shell.
     *
     * @param cmd A command instance.
     */
    public registerCommand(cmd: ICommand): void {
        this.commands[cmd.name] = cmd;
    }

    /**
     * Clears the log
     */
    public clearLog() {
        if(this.terminal !== undefined){
            this.terminal.clearLog()
        }
    }

    /**
     * Attaches this shell to a terminal.
     * 
     * The shell can in principle be moved from one terminal to another without
     * breaking functionnality or losing state, allowing complex setups such as GNU screen.
     *
     * @param terminal The web terminal to bind to.
     */
    public attach(terminal: Terminal) {
        this.terminal = terminal;
        this.terminal.setHandler(this);
        this.terminal.prompt = this.defaultPrompt;
    }

    /**
     * Prints a help message describing the available commands.
     */
    public printShortHelp(): void {
        const availableCommands = `Available commands: 
        ${ Object.keys(this.commands)
            .map(c => '<i>'+c+'</>')
            .join(',')
        }`;
        this.safeGetTerminal().print(availableCommands, { unsafe_i_know_what_i_am_doing: true });
    }

    /**
     * Prints a help message describing the available commands.
     */
    public printHelp(): void {
        const availableCommands = `Available commands:<br>
        <table class="helptable">
        ${ Object.keys(this.commands)
            .map(c => Formatter.format('<tr><td>- <b>%</b></td><td>%</td></tr>', ...[c, this.commands[c].description])).join('')
        }
        </table>`;
        this.safeGetTerminal().print(availableCommands, { unsafe_i_know_what_i_am_doing: true });
    }

    /**
     * When true, the terminal is waiting for some command to complete and is not interactive.
     */
    public get isBusy() {
        return this.busyIndicator != null;
    }

    public onKeyDown = (evt: KeyboardEvent, term: Terminal) => {
        if (this.isBusy) {
            evt.preventDefault();
            return;
        }
        switch (evt.key) {
            case 'Enter':
                evt.preventDefault();
                if (!this.isBusy) {
                    this.acceptCommand();
                }
                break;
            case 'ArrowUp':
                evt.preventDefault();
                term.promptInput = this.history.previous();
                break;
            case 'ArrowDown':
                evt.preventDefault();
                term.promptInput = this.history.next();
                break;
            case 'Tab':
                evt.preventDefault();
                if (!this.isBusy) {
                    this.autoCompleteCommand();
                }
            case 'c':
                if (evt.ctrlKey) {
                    this.abortPrompt();
                }
                break;
            case 'Escape':
                this.abortPrompt();
                break;
        }
    }

    public onKeyUp(_evt: KeyboardEvent, term: Terminal) {
        this.history.setCurrent(term.promptInput);
    }

    private computeAutocompletion(line: string, pos: number): ICompletionResponse | null {
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

    private safeGetTerminal(): Terminal {
        if (this.terminal == null) {
            throw new Error('This shell is not attached!');
        }
        return this.terminal;
    }

    private handleCommand(command: string): void | Promise<void> {
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
            this.enterBusyMode();
            result.then(
                () => this.exitBusyMode(),
                () => this.exitBusyMode()
            );
        }
    }

    private acceptCommand() {
        const term = this.safeGetTerminal();
        term.printCurrentPrompt();
        const command = term.promptInput;
        if (this.promptResolve != null) {
            const resolve = this.promptResolve;
            this.promptResolve = null;
            term.prompt = this.defaultPrompt;
            term.secretMode = false;
            resolve(Promise.resolve(command));
        } else {
            this.history.setCurrent(command);
            this.history.commit();
            term.promptInput = '';
            this.handleCommand(command.trim());
        }
        setImmediate(() => term.scrollToBottom());
    }

    private autoCompleteCommand() {
        const term = this.safeGetTerminal();
        const result = this.computeAutocompletion(term.promptInput, term.carretPosition);
        if (result != null) {
            term.promptInput = result.line;
            term.carretPosition = result.pos;
        }
    }


    private enterBusyMode() {
        if (this.busyIndicator == null) {
            this.busyIndicator = new BusyIndicator((ind) => {
                this.safeGetTerminal().prompt = ind;
            });
        }
    }

    private exitBusyMode() {
        const term = this.safeGetTerminal();
        if (this.busyIndicator) {
            this.busyIndicator.stop();
            this.busyIndicator = null;
            term.promptInput = '';
            term.prompt = this.defaultPrompt;
        }
    }

    private abortPrompt() {
        if (this.promptResolve) {
            const term = this.safeGetTerminal();
            const resolve = this.promptResolve;
            this.promptResolve = null;
            term.printCurrentPrompt();
            resolve(Promise.reject('Aborted'));
        }
    }

    /**
     * Executes an action outside of busy mode, restoring busy mode afterwards if necessary
     */
    private unbusyAction<T>(cb: (term: Terminal) => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            setImmediate(async () => {
                const term = this.safeGetTerminal();
                const wasBusy = this.isBusy;
                if (wasBusy) {
                    this.exitBusyMode();
                }
                const restore = () => {
                    if (wasBusy) {
                        this.enterBusyMode();
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
}