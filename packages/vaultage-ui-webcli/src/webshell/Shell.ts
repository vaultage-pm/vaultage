import { html, SanitizedString } from '../security/xss';
import { BusyIndicator } from './BusyIndicator';
import { History } from './History';
import { ICommand } from './ICommand';
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
 *  - Basic command name autocompletion (TODO (#112): advanced per-command autocompletion)
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

    /**
     * Main text shown when clearing the screen
     */
    private bannerHTML: SanitizedString = html`Welcome to my shell!`;

    constructor(
        private terminal?: Terminal) {
        if (terminal) {
            this.attach(terminal);
        }
    }

    /**
     * Sets the message shown at startup and when calling `printBanner`.
     * This string may contain HTML tags AND MUST NOT CONTAIN RAW USER INPUT.
     */
    public setBannerHTML(banner: SanitizedString) {
        this.bannerHTML = banner;
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
    public echoError(value: string | Error) {

        const message = typeof value === 'string' ? value : value.message;

        // cleans encapsulated errors
        while (message.startsWith('Error: Error: ')) {
            value = message.substring(7);
        }

        this.safeGetTerminal().print(
            html`<span class="error">${message}</span>`.valueOf(),
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
    public echoHTML(value: SanitizedString) {
        if (value.isEmpty()) {
            return;
        }
        this.safeGetTerminal().print(value.valueOf(), { unsafe_i_know_what_i_am_doing: true });
    }

    /**
     * Asks a yes/no question.
     */
    public promptYesNo(question: SanitizedString, defaultAnswer?: 'yes' | 'no'): Promise<'yes' | 'no'> {
        return this.unbusyAction((term) => new Promise((resolve) => {
            const prompt = defaultAnswer === 'yes' ? 'Y/n' : 'y/N';
            term.prompt = `${question} ${prompt} &nbsp;`;
            term.focus();
            this.promptResolve = (p) => resolve(p.then((text) => {
                if (/y(es)?/i.test(text)) {
                    return 'yes';
                } else if (/n(o)?/i.test(text)) {
                    return 'no';
                } else {
                    return defaultAnswer || 'no';
                }
            }));
        }));
    }

    /**
     * Opens up a file selection dialog.
     *
     * The promise resolves if at least one file has been selected.
     */
    public promptFile(): Promise<FileList> {
        const term = this.safeGetTerminal();
        const uniqueId = 'file-' + (Math.random() * 10000).toString(16);
        term.print(`<input id="${uniqueId}" type="file" />`, { unsafe_i_know_what_i_am_doing: true });
        const fileInput = document.getElementById(uniqueId) as HTMLInputElement;
        fileInput.click();

        return new Promise<FileList>((resolve, reject) => {
            // We want to react to user-initiated abortion of the prompt: In this case we remove the element and return an error.
            this.promptResolve = (result) => {
                result.catch((e) => {
                    reject(e);
                    fileInput.remove();
                });
            };

            fileInput.addEventListener('change', (_) => {
                fileInput.remove();
                if (fileInput.files != null && fileInput.files.length > 0) {
                    resolve(fileInput.files);
                } else {
                    reject('No file selected');
                }
            });
        });
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
        return this.unbusyAction((term) => new Promise((resolve) => {
            term.prompt = question + '&nbsp;';
            term.focus();

            if (defaultValue !== undefined) {
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
        return this.unbusyAction((term) => new Promise((resolve) => {
            term.secretMode = true;
            term.prompt = question + '&nbsp;';
            term.focus();
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
        if (this.terminal !== undefined) {
            this.terminal.clearLog();
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
    public printBanner(): void {
        if (!this.bannerHTML.isEmpty()) {
            this.echoHTML(this.bannerHTML);
        }
    }

    /**
     * Prints a help message describing the available commands.
     */
    public printHelp(): void {
        const availableCommands = `Available commands:<br>
        <table class="helptable">
        ${ Object.keys(this.commands)
            .map((c) => html`<tr><td>- <b>${c}</b></td><td>${this.commands[c].description}</td></tr>`).join('')
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
        if (!this.isBusy) {
            switch (evt.key) {
                case 'Enter':
                    evt.preventDefault();
                    this.acceptCommand();
                    return;
                case 'ArrowUp':
                    evt.preventDefault();
                    term.promptInput = this.history.previous();
                    return;
                case 'ArrowDown':
                    evt.preventDefault();
                    term.promptInput = this.history.next();
                    return;
                case 'Tab':
                    evt.preventDefault();
                    this.autoCompleteCommand();
                    return;
            }
        }
        switch (evt.key) {
            case 'c':
            if (evt.ctrlKey) {
                this.abortPrompt();
            }
            return;
        case 'Escape':
            this.abortPrompt();
            return;
        }
    }

    public onKeyUp(_evt: KeyboardEvent, term: Terminal) {
        this.history.setCurrent(term.promptInput);
    }

    public async runCommand(command: ICommand, args: string[]) {
        try {
            const result = command.handle(args);
            if (result && result.then) {
                // Handles asynchronous workflow (error and happy path)
                this.enterBusyMode();
                try {
                    await result;
                } finally {
                    this.exitBusyMode();
                }
            }
        } catch (e) {
            // This branch handles synchronous errors
            this.echoError('' + e);
            console.error(e);
        }
    }

    private safeGetTerminal(): Terminal {
        if (this.terminal == null) {
            throw new Error('This shell is not attached!');
        }
        return this.terminal;
    }

    private async handleCommand(command: string): Promise<void> {
        const terminal = this.safeGetTerminal();
        const parts = command.trim().split(' ');
        const handler = this.commands[parts[0]];
        if (handler == null) {
            terminal.print('unknow command "' + parts[0] + '"');
            this.printHelp();
            return;
        }
        await this.runCommand(handler, parts.slice(1));
    }

    private async acceptCommand() {
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
            await this.handleCommand(command);
            this.echo('');
        }
        setImmediate(() => term.scrollToBottom());
    }

    /**
     * Returns a list of possible autocompletion words given the cursor position
     */
    private getPossibleCompletions(n: number, prefix: string, line: string): string[] {
        if (n === 0) {
            // Autocomplete the command itself
            return Object.keys(this.commands);
        } else {
            // Autocomplete a command argument
            const cmdName = line.trim().split(' ')[0];
            if (!cmdName) {
                return [];
            }
            const cmd = this.commands[cmdName];
            if (cmd && cmd.handleAutoCompleteParam) {
                return cmd.handleAutoCompleteParam(n - 1, prefix, line);
            }
        }
        return [];
    }

    /**
     * Finds which word the user is trying to autocomplete and rewrites the completed input
     * or prints the possible completions.
     */
    private autocompleteAlgorithm(line: string, pos: number): ICompletionResponse | null {
        const splitted = line.split(' ');
        let commandSoFar = '';

        let currentWord = 0;

        // Finds which word the user is trying to autocomplete
        for (let i = 0 ; i < splitted.length ; i++) {
            const word = splitted[i];
            if (pos <= commandSoFar.length + word.length) {
                // Autocomplete the current word
                const matching = this.getPossibleCompletions(currentWord, word, line).filter((k) => k.startsWith(word));
                if (matching.length === 1) {
                    const isLastWord = i === splitted.length - 1;
                    const outLine = commandSoFar + matching[0] + line.substr(commandSoFar.length + word.length);
                    const addSpace = isLastWord && outLine.substr(-1) !== ' ';
                    return {
                        line: commandSoFar + matching[0] + line.substr(commandSoFar.length + word.length) + (addSpace ? ' ' : ''),
                        pos: matching[0].length + (addSpace ? 1 : 0) + commandSoFar.length
                    };
                } else if (matching.length > 1) {
                    this.safeGetTerminal().printCurrentPrompt();
                    this.safeGetTerminal().print(matching
                            .map((k) => html`<b>${k}</b>`)
                            .join('&#9;')
                        , { unsafe_i_know_what_i_am_doing: true });
                    return null;
                }
            } else {
                // Go to the next word
                commandSoFar += word + ' ';
            }
            if (word !== '') {
                currentWord++;
            }
        }
        return null;
    }

    private autoCompleteCommand() {
        const term = this.safeGetTerminal();
        const result = this.autocompleteAlgorithm(term.promptInput, term.carretPosition);
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
            term.secretMode = false;
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
                };
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
