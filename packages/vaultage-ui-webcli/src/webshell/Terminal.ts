
export interface ICompletionResponse {
    line: string;
    pos: number;
}

/**
 * Event handler for events coming from the log.
 */
export interface ICommandHandler {
    /**
     * Dispatched when a key is pressed within the command input.
     *
     * Typical handlers will use this callback to treat special keys
     * and may call evt.preventDefault(); to prevent the underlying text
     * input from receiving that key.
     *
     * Exemple:
     * // Prevents the letter 'e' from being typed into the field using the 'e' key.
     * if (evt.key === 'e') evt.preventDefault();
     */
    onKeyDown: (evt: KeyboardEvent, term: Terminal) => void;

    /**
     * Dispatched when a key is released within the command input.
     */
    onKeyUp: (evt: KeyboardEvent, term: Terminal) => void;
}

export interface IPrintOptions {
    /**
     * Allow the text to be rendered as raw HTML.
     * By using this option you acknowlege that the provided string is 100%
     * under your control or you'll end up with an XSS vulnerability.
     */
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

    /**
     * A default command handler.
     *
     * If not provided and no handler is attached at a later stage, the terminal
     * will not do anything, not even allow the user to type any text.
     */
    handler?: ICommandHandler;
}

const defaultHandler: ICommandHandler = {
    onKeyDown(evt) { evt.preventDefault(); },
    onKeyUp() { }
};


/**
 * Terminal DOM object.
 *
 * This class constructs and wraps the DOM of a simple command based terminal emulator.
 * None of the shell logic actually happens here. This class simply exposes an API
 * on top of which a shell can be constructed.
 *
 * This terminal is made of a command prompt, a command input and a log.
 * - The command prompt is a few characters placed before the text input to tell the user what
 * she is expected to type in. This can be changed by setting `prompt` to the desired value.
 * - The command input is the actual text input where the user types something. It can be set
 * to a password type by setting `secretMode` to true.
 * - The log is where past commands and program output is shown. HTML can be used to provide
 * rich formatting of the log but it is advised not to abuse this feature.
 *
 * A single handler is allowed to receive terminal events by registering using `setHandler`
 */
export class Terminal {

    private $log: Element;
    private $input: HTMLInputElement;
    private $prompt: HTMLElement;
    private $el: Element;

    private handler: ICommandHandler = defaultHandler;

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

        this.$el.addEventListener('keydown', (evt: KeyboardEvent) => this.handler.onKeyDown(evt, this));
        this.$el.addEventListener('keyup', (evt: KeyboardEvent) => this.handler.onKeyUp(evt, this));
        this.$el.addEventListener('mouseup', () => setImmediate(() => this.onMouseUp()));
    }

    /**
     * Focuses the command input
     */
    public focus() {
        this.$input.focus();
    }

    /**
     * Scrolls the log to the point where the latest line is visible.
     */
    public scrollToBottom() {
        this.$el.scrollTop = this.$input.offsetTop;
    }

    /**
     * Scrolls the log to the beginning.
     */
    public scrollToTop() {
        this.$el.scrollTop = 0;
    }

    /**
     * Sets the unique event handler for this terminal.
     * See ICommandHandler for details.
     *
     * @param handler New unique event handler
     */
    public setHandler(handler: ICommandHandler) {
        this.handler = handler;
    }

    /**
     * Clears the log of all data
     */
    public clearLog() {
        this.$log.innerHTML = '';
    }


    /**
     * Appends a separator
     *
     * @param text The text to append.
     * @param opts Advanced options
     */
    public separator(): Element {
        const entry = document.createElement('span');
        entry.className = 'separator';
        this.$log.appendChild(entry);
        this.scrollToBottom();
        return entry;
    }

    /**
     * Appends text to the log.
     *
     * @param text The text to append.
     * @param opts Advanced options
     */
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

    /**
     * Appends the content of the current prompt and prompt input to the log with proper formatting.
     */
    public printCurrentPrompt(): Element {
        const el = this.createCommandLogEntry();
        if (this.secretMode) {
            el.innerHTML = this.promptInput.replace(/./g, '&bull;');
        } else {
            el.innerText = this.promptInput;
        }
        return el;
    }

    /**
     * This value indicates whether the command input should be hidden.
     * Set or read this value as you please.
     */
    public set secretMode(value: boolean) {
        if (value) {
            this.$input.type = 'password';
        } else {
            this.promptInput = '';
            this.$input.type = 'text';
        }
    }

    public get secretMode() {
        return this.$input.type === 'password';
    }

    /**
     * User-inputted value currently pending in the prompt input field.
     */
    public set promptInput(val: string) {
        this.$input.value = val;
    }

    public get promptInput() {
        return this.$input.value;
    }

    /**
     * Small piece of text shown to the left of the prompt input.
     *
     * Do not, ever, show user input in the prompt. This value is not escaped
     * and is rendered as raw HTML!
     *
     * The reason for accepting HTML here is that you'll often want to use html
     * special characters (eg. &nbsp; to leave a space between the prompt and the user input).
     */
    public set prompt(val: string) {
        this.$prompt.innerHTML = val;
    }

    public get prompt() {
        return this.$prompt.innerText;
    }

    /**
     * Position of the carret within the prompt input (R/W)
     */
    public get carretPosition() {
        return this.$input.selectionEnd;
    }

    public set carretPosition(pos: number) {
        this.$input.selectionStart = this.$input.selectionEnd = pos;
    }

    /**
     * true when the user has selected some text somewhere on the page.
     */
    public get hasSelection() {
        return window.getSelection().type === 'Range';
    }

    private onMouseUp() {
        if (!this.hasSelection) {
            this.$input.focus();
        }
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
}
