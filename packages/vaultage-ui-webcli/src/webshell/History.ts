
export class History {

    private backlog: string[] = [];

    private history: string[] = [''];

    private cursor: number = 0;

    public commit() {
        const command = this.history[this.cursor];
        if (command !== this.backlog[0]) {
            this.backlog.splice(0, 0, command);
        }
        this.cursor = 0;
        this.history = ['', ...this.backlog];
    }

    public setCurrent(command: string) {
        this.history[this.cursor] = command;
    }

    public previous(): string {
        if (this.cursor < this.history.length - 1) {
            this.cursor++;
        }
        return this.history[this.cursor];
    }

    public next(): string {
        if (this.cursor > 0) {
            this.cursor--;
        }
        return this.history[this.cursor];
    }

    public last(): string {
        this.cursor = 0;
        return this.history[this.cursor];
    }

    public first(): string {
        this.cursor = this.history.length - 1;
        return this.history[this.cursor];
    }
}