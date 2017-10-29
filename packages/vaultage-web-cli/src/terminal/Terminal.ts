import { BusyIndicator } from './BusyIndicator';
import { History } from './History';

export interface ICompletionResponse {
    line: string;
    pos: number;
}

export interface ICommandHandler {
    onCommand: (command: string) => void;
    onCompletionRequest?: (line: string, pos: number) => ICompletionResponse | null;
}

export interface IPrintOptions {
    unsafe_i_know_what_i_am_doing: boolean;
}

export interface ITerminalOptions {
    /**
     * The DOM element to attach to
     */
    root?: Element;

    /**
     * A prompt string (defaults to '> ')
     */
    prompt?: string;

    handler?: ICommandHandler;
}

const defaultHandler = {
    onCommand() {
        // no-op
    }
};

export class Terminal {

    private $log: Element;
    private $input: HTMLInputElement;
    private $prompt: HTMLElement;
    private $el: Element;

    private handler: ICommandHandler = defaultHandler;

    private busyIndicator: BusyIndicator | null = null;

    private history: History = new History();

    constructor(options?: ITerminalOptions) {
        this.$el = document.createElement('div');
        this.$el.className = 'terminal';

        this.$log = document.createElement('pre');
        this.$log.className = 'log';

        this.$input = document.createElement('input');
        this.$input.type = 'text';
        this.$input.className = 'input';

        this.$prompt = document.createElement('b');
        this.$prompt.className = 'prompt';

        const promptLine = document.createElement('div');
        promptLine.appendChild(this.$prompt);
        promptLine.appendChild(this.$input);
        promptLine.className = 'promptLine';

        this.$el.appendChild(this.$log);
        this.$el.appendChild(promptLine);

        if (options) {
            if (options.root) {
                options.root.appendChild(this.$el);
            }
            if (options.prompt) {
                this.prompt = options.prompt;
            } else {
                this.prompt = '>&nbsp;';
            }
            if (options.handler) {
                this.handler = options.handler;
            }
        }

       this.focus();
       this.initPrompt();

       this.$el.addEventListener('keydown', (evt: KeyboardEvent) => this.onKeyDown(evt));
       this.$el.addEventListener('keyup', () => this.onKeyUp());
       this.$el.addEventListener('mouseup', () => setImmediate(() => this.onMouseUp()));
    }

    public focus() {
        this.$input.focus();
    }

    public scrollToBottom() {
        this.$el.scrollTop = this.$input.offsetTop;
    }

    public scrollToTop() {
        this.$el.scrollTop = 0;
    }

    public get isBusy() {
        return this.busyIndicator != null;
    }

    public setHandler(handler: ICommandHandler) {
        this.handler = handler;
    }

    public print(text: string, opts?: IPrintOptions): Element {
        const entry = document.createElement('span');
        if (opts && opts.unsafe_i_know_what_i_am_doing === true) {
            entry.innerHTML = text;
        } else {
            entry.innerText = text;
        }
        entry.appendChild(document.createElement('br'));
        this.$log.appendChild(entry);
        this.scrollToBottom();
        return entry;
    }

    public printCurrentPrompt(): Element {
        const el = this.createCommandLogEntry();
        if (this.isSecret) {
            el.innerHTML = this.promptValue.replace(/./g, '&bull;');
        } else {
            el.innerText = this.promptValue;
        }
        return el;
    }

    private onKeyDown(evt: KeyboardEvent) {
        if (this.isBusy) {
            evt.preventDefault();
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
                this.promptValue = this.history.previous();
                break;
            case 'ArrowDown':
                evt.preventDefault();
                this.promptValue = this.history.next();
                break;
            case 'Tab':
                evt.preventDefault();
                if (!this.isBusy) {
                    this.autoCompleteCommand();
                }
                break;
        }
    }

    private onKeyUp() {
        this.history.setCurrent(this.promptValue);
    }

    private onMouseUp() {
        if (!this.hasSelection) {
            this.$input.focus();
        }
    }

    private acceptCommand() {
        this.printCurrentPrompt();
        const command = this.promptValue;
        this.history.setCurrent(command);
        this.history.commit();
        this.initPrompt();
        this.handler.onCommand(command);
        setImmediate(() => this.scrollToBottom());
    }

    private autoCompleteCommand() {
        if (this.handler.onCompletionRequest != null) {
            const result = this.handler.onCompletionRequest(this.promptValue, this.carretPosition);
            if (result != null) {
                this.promptValue = result.line;
                this.carretPosition = result.pos;
            }
        }
    }

    private initPrompt() {
        this.promptValue = '';
    }

    private createCommandLogEntry(): HTMLElement {
        const line = document.createElement('div');
        const prompt = document.createElement('b');
        prompt.innerHTML = this.prompt;
        line.appendChild(prompt);
        const entry = document.createElement('span');
        entry.className = 'cmd';
        entry.appendChild(document.createElement('br'));
        line.appendChild(entry);
        this.$log.appendChild(line);
        return entry;
    }

    public enterBusyMode() {
        if (this.busyIndicator == null) {
            this.busyIndicator = new BusyIndicator((ind) => {
                this.$input.value = ind;
            });
        }
    }

    public exitBusyMode() {
        if (this.busyIndicator) {
            this.busyIndicator.stop();
            this.busyIndicator = null;
            this.initPrompt();
        }
    }

    public enterSecretMode() {
        this.$input.type = 'password';
    }

    public exitSecretMode() {
        this.promptValue = '';
        this.$input.type = 'text';
    }

    public get isSecret() {
        return this.$input.type === 'password';
    }

    public set promptValue(val: string) {
        this.$input.value = val;
    }

    public get promptValue() {
        return this.$input.value;
    }

    public set prompt(val: string) {
        this.$prompt.innerHTML = val;
    }

    public get prompt() {
        return this.$prompt.innerText;
    }

    private get carretPosition() {
        return this.$input.selectionEnd;
    }

    private set carretPosition(pos: number) {
        this.$input.selectionStart = this.$input.selectionEnd = pos;
    }

    private get hasSelection() {
        return window.getSelection().type === 'Range';
    }
}
