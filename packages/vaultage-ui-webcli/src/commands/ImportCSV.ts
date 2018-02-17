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
        const [titleColumn, usernameColumn, passwordColumn, urlColumn] = [
            await this.shell.prompt('What should I use for the title?'),
            await this.shell.prompt('What should I use for the username?'),
            await this.shell.prompt('What should I use for the password?'),
            await this.shell.prompt('What should I use for the url?')
        ].map((txt) => {
            const id = header.indexOf(txt);
            if (id === -1) {
                throw new Error(`No such field: ${txt}`);
            }
            return id;
        });

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
                resolve(fileReader.result);
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
