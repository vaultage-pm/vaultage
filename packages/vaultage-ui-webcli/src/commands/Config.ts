import { Config } from '../Config';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

const AVAILABLE_OPTIONS: {[key: string]: keyof Config } = {
    default_username: 'defaultUserName'
};

export class ConfigCommand implements ICommand {
    public readonly name = 'config';

    public readonly description = 'Configures the application.';
    constructor(
        private shell: Shell,
        private config: Config) {
    }

    public async handle(args: string[]) {

        switch (args[0]) {
            case 'set':
                this.set(this.parseArg('key', args[1]), this.parseArg('value', args[2]));
                break;
            case 'get':
                this.get(this.parseArg('key', args[1]));
                break;
            default:
                this.printUsage();
        }
    }

    public handleAutoCompleteParam(n: number): string[] {
        if (n === 0) {
            return ['set', 'get'];
        } else if (n === 1) {
            return Object.keys(AVAILABLE_OPTIONS);
        }
        return [];
    }

    private printUsage() {
        this.shell.echo('Usage: config <set|get> key [value]');
    }

    private set(key: string, value: string) {
        const configName = this.convertKeyToConfigEntry(key);
        this.config[configName] = value;
        this.shell.echo('OK');
    }

    private get(key: string) {
        const configName = this.convertKeyToConfigEntry(key);
        this.shell.echo(this.config[configName]);
    }

    private convertKeyToConfigEntry(key: string): keyof Config {
        const setting = AVAILABLE_OPTIONS[key];
        if (!setting) {
            throw new Error(`Invalid key: ${key}`);
        }
        return setting;
    }

    private parseArg(name: string, value: string | undefined): string {
        if (!value) {
            this.printUsage();
            throw new Error(`Missing argument '${name}'.`);
        }
        return value;
    }
}