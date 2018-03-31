import { TimeoutCall } from './commands/TimeoutCall';
import { Config } from './Config';
import { Context } from './Context';
import { ICommand } from './webshell/ICommand';
import { Shell } from './webshell/Shell';


const TIME_FORMAT_RX = /(\d+)(h|m|s)?|0|/;
const TIME_FORMAT_UNITS = { s: 1, m: 60, h: 3600 };
const MIN_TIMEOUT = 10; // Minimum settings for the timeout (in seconds)

export class TimeoutService {

    private timeoutTrigger: NodeJS.Timer | null = null;

    private readonly timeoutCommand: ICommand;

    private isRunningTimeout: boolean = false;

    constructor(
        private shell: Shell,
        private ctx: Context,
        private cfg: Config
    ) {
        this.timeoutCommand = new TimeoutCall(shell, ctx);
    }

    public resetTimeout() {
        if (this.isRunningTimeout) {
            return;
        }
        if (this.timeoutTrigger !== null) {
            clearTimeout(this.timeoutTrigger);
            this.timeoutTrigger = null;
        }
        const timeoutTime = this.validateTimeoutFormat(this.cfg.sessionTimeout);
        if (timeoutTime === 0) {
            return; // Session timeout is disabled
        }
        if (this.ctx.isAuthenticated()) {
            this.timeoutTrigger = setTimeout(async () => {
                this.isRunningTimeout = true;
                try {
                    this.shell.runCommand(this.timeoutCommand, []);
                } finally {
                    this.isRunningTimeout = false;
                    this.resetTimeout();
                }
            }, timeoutTime * 1000);
        }
    }

    public validateTimeoutFormat(input: string): number {
        const match = input.match(TIME_FORMAT_RX);
        if (match == null) {
            throw new Error('Invalid timeout format');
        }
        if (match[0] == null) {
            return 0;
        }
        const numeric = match[1] == null ? 0 : parseInt(match[1], 10);
        if (numeric !== numeric) { // isNaN
            throw new Error('Invalid timeout format');
        }
        const unit = match[2] != null ? match[2] as keyof typeof TIME_FORMAT_UNITS : 's';
        const value = numeric * TIME_FORMAT_UNITS[unit];
        if (value !== 0 && value < MIN_TIMEOUT) {
            throw new Error(`Timeout is too low (minimum: ${MIN_TIMEOUT}s)`);
        }
        return value;
    }
}
