import { Config } from '../Config';
import { TimeoutService } from '../TimeoutService';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class ConfigCommand implements ICommand {
    public readonly name = 'config';

    public readonly availableKeys = Object.keys(Config.prototype).filter((key) => key !== 'reset');

    public readonly description = 'Configures the application.';
    constructor(
        private shell: Shell,
        private config: Config,
        private timeout: TimeoutService) {
    }

    public async handle(args: string[]) {

        switch (args[0]) {
            case 'set':
                this.set(this.convertKeyToConfigEntry(args[1]), args[2]);
                break;
            case 'get':
                if (args.length < 2) {
                    this.get(undefined);
                } else {
                    this.get(this.convertKeyToConfigEntry(args[1]));
                }
                break;
            case 'clear':
                this.clear(this.convertKeyToConfigEntry(args[1]));
                break;
            default:
                this.printUsage();
        }
    }

    public handleAutoCompleteParam(n: number): string[] {
        if (n === 0) {
            return ['set', 'get', 'clear'];
        } else if (n === 1) {
            return this.availableKeys;
        }
        return [];
    }

    private printUsage() {
        this.shell.echo('Usage: `config <set|get|clear> key [value]`, or `config get` to see the current config.');
        this.shell.echo('keys: ' + this.availableKeys.join(','));
    }

    private clear(key: string) {
        const configName = this.convertKeyToConfigEntry(key);
        this.config.reset(configName);
        this.shell.echo('OK');
    }

    private castToType<T extends keyof Config>(key: T, value: string): Config[T] {
        const typedPreviousValue = this.config[key];

        let castedValue: Config[T];
        if (typeof this.config[key] === 'boolean') {
            castedValue = (value === 'true') as Config[T]; // we know Config[T] is a boolean
        } else {
            castedValue = value as (typeof typedPreviousValue); // cast it as the type it was before
        }

        return castedValue;
    }

    private set<T extends keyof Config>(key: T, value: string | undefined) {
        if (value === undefined) {
            throw new Error(`Value required.`);
        }

        if (key === 'sessionTimeout') {
            this.timeout.validateTimeoutFormat(value);
        }
        const previousValue = this.config[key];

        this.config[key] = this.castToType(key, value);
        const newValue = this.config[key];

        if (key === 'sessionTimeout') {
            this.timeout.resetTimeout();
        }
        this.shell.echo(`OK, previous value was ${previousValue}, new value is ${newValue}.`);
    }

    private get<T extends keyof Config>(key: T | undefined) {
        if (key === undefined) {
            for (const key2 of this.availableKeys) {
                const configName = this.convertKeyToConfigEntry(key2);
                this.shell.echo(`${key2} => ${this.config[configName]}`);
            }
        } else {
            const configName = this.convertKeyToConfigEntry(key);
            this.shell.echo(String(this.config[configName]));
        }
    }

    private convertKeyToConfigEntry(key: string): keyof Config {
        if (key === undefined) {
            throw new Error(`Please provide a configuration key (${this.availableKeys.join(',')}).`);
        }
        if (this.keyInConfig(key)) {
            return key;
        }
        throw new Error(`Invalid key: "${key}"`);
    }

    private keyInConfig(value: string): value is keyof Config {
        return (value in Config.prototype);
    }
}
