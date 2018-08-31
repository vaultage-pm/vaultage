import { Context } from '../Context';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class ImportCSVCommand implements ICommand {
    public readonly name = 'import-csv';

    public readonly description = 'Imports entries from a CSV file';

    private readonly MAX_FILE_SIZE = 1000000; // A file larger than 1MB is probably not a CSV of passwords...

    constructor(
        private shell: Shell,
        private ctx: Context) {
    }

    public async handle() {
        this.shell.echo('Please chose a CSV file');
        const files = await this.shell.promptFile();

        const plainText = await this.getFileContents(files[0]);

        const reader = new CSVReader(plainText);

        const header = reader.getHeader();

        this.shell.echo('Available fields:');
        this.shell.echo(header.join(', '));

        const titleColumn       = await this.askFieldMapping('title', ['title', 'name'], header);
        const usernameColumn    = await this.askFieldMapping('username', ['username', 'login', 'user'], header);
        const passwordColumn    = await this.askFieldMapping('password', ['password', 'pass', 'pwd'], header);
        const urlColumn         = await this.askFieldMapping('url', ['url', 'href', 'site'], header);

        let nEntries = 0;
        while (reader.hasNext()) {
            nEntries++;
            const entry = reader.next();
            this.ctx.vault.addEntry({
                login: entry[usernameColumn],
                password: entry[passwordColumn],
                title: entry[titleColumn],
                url: entry[urlColumn]
            });
        }

        this.shell.echo(`Saving ${nEntries} new entries...`);

        await this.ctx.vault.save();

        this.shell.echo('Done');
    }

    /**
     * Asks the user to provide the name of the source column to map onto the destination column
     * @param fieldName name of the destination column
     * @param preferredValues List of prefered values. The first one to match a header column is used as a
     * default value. If none match, default is blank.
     * @param header the csv header
     */
    private async askFieldMapping(fieldName: string, preferredValues: string[], header: string[]): Promise<number> {
        let id = -1;
        let defaultValue: string | undefined;
        for (const preferred of preferredValues) {
            if (header.indexOf(preferred) !== -1) {
                defaultValue = preferred;
                break;
            }
        }
        while (id === -1) {
            const txt = await this.shell.prompt(
                    `What should I use for the ${fieldName}?`,
                    defaultValue);
            id = header.indexOf(txt);
            if (id === -1) {
                this.shell.echoError(`No such field: ${txt}`);
            }
        }
        return id;
    }

    private getFileContents(file: File): Promise<string> {
        if (file.type !== 'text/plain') {
            return Promise.reject(`Invalid file type: ${file.type}`);
        }
        if (file.size > this.MAX_FILE_SIZE) {
            return Promise.reject(`This file is very large (${file.size} bytes. I don't think it is a csv of passwords...`);
        }
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (_) => {
                // We must force the type because TypeScript can't infer that `readAsText` below causes the result to be a string
                resolve(fileReader.result as string);
            };
            fileReader.onerror = reject;
            fileReader.readAsText(file);
        });
    }
}

class CSVReader {

    private lines: string[];

    private cur: number = 0;

    private header: string[] | null = null;

    constructor(input: string) {
        this.lines = input.split('\n');
        this.skipEmptyLines();
    }

    public getHeader(): string[] {
        if (this.header !== null) {
            return this.header;
        }
        if (!this.hasNext()) {
            throw new Error('The file is empty!');
        }
        return this.header = this.next();
    }

    public hasNext(): boolean {
        return this.cur < this.lines.length;
    }

    public next(): string[] {
        if (!this.hasNext()) {
            throw new Error('EOF');
        }
        const next = this.lines[this.cur];
        this.cur++;
        this.skipEmptyLines();
        return next.split(',');
    }

    private skipEmptyLines() {
        while (this.hasNext() && this.lines[this.cur] === '') {
            this.cur++;
        }
    }
}
