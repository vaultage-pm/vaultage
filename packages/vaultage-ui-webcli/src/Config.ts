export const PWD_GEN_LENGTH = 16;
export const PWD_GEN_USE_SYMBOLS = false;
export const PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS = true;
export const PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING = true;


/**
 * Configuration settings of the webui client application.
 */
export class Config {

    private static readonly USERNAME_KEY = 'DEFAULT_USERNAME';
    private static readonly HOST_KEY = 'DEFAULT_HOST';
    private static readonly TIMEOUT_KEY = 'TIMEOUT_TIME';
    private static readonly USAGE_COUNT_VISIBILITY = 'USAGE_COUNT_VISIBILITY';
    private static readonly SHOW_MAX_N_RESULTS = 'SHOW_MAX_N_RESULTS';

    /**
     * Default username to show in an auth prompt. This value is local to the browser.
     */
    public get defaultUserName(): string {
        const username = localStorage.getItem(Config.USERNAME_KEY);
        if (username == null) {
            return '';
        } else {
            return username;
        }
    }

    public set defaultUserName(username: string) {
        localStorage.setItem(Config.USERNAME_KEY, username);
    }

    /**
     * Show usage count
     */
    public get usageCountVisibility(): boolean {
        const visible = localStorage.getItem(Config.USAGE_COUNT_VISIBILITY);
        return (visible === 'true');
    }

    public set usageCountVisibility(visible: boolean) {
        localStorage.setItem(Config.USAGE_COUNT_VISIBILITY, String(visible));
    }


    /**
     * Truncates results to the top N, if N != -1
     */
    public get showAtMostNResults(): number {
        const n = localStorage.getItem(Config.SHOW_MAX_N_RESULTS);
        if (n == null) {
            return -1;
        }
        if (isNaN(Number(n))) {
            return -1;
        }
        return Number(n);
    }

    public set showAtMostNResults(n: number) {
        localStorage.setItem(Config.SHOW_MAX_N_RESULTS, String(n));
    }

    /**
     * Default host to contact.
     */
    public get defaultHost(): string {
        const host = localStorage.getItem(Config.HOST_KEY);
        if (host == null) {
            return '';
        } else {
            return host;
        }
    }

    public set defaultHost(host: string) {
        localStorage.setItem(Config.HOST_KEY, host);
    }

    /**
     * Time delay in seconds after which the UI should log out automatically.
     */
    public get sessionTimeout(): string {
        const seconds = localStorage.getItem(Config.TIMEOUT_KEY);
        if (seconds == null) {
            return '';
        } else {
            return seconds;
        }
    }

    public set sessionTimeout(seconds: string) {
        localStorage.setItem(Config.TIMEOUT_KEY, seconds);
    }
}
