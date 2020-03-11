export const PWD_GEN_LENGTH = 16;
export const PWD_GEN_USE_SYMBOLS = false;
export const PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS = true;
export const PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING = true;
const DEFAULT_MAX_NUMBER_OF_PASSWORD_RETURNED = 10

/**
 * Configuration settings of the webui client application.
 */
export class Config {

    private static readonly USERNAME_KEY = 'DEFAULT_USERNAME';
    private static readonly HOST_KEY = 'DEFAULT_HOST';
    private static readonly TIMEOUT_KEY = 'TIMEOUT_TIME';
    private static readonly USAGE_COUNT_VISIBILITY_KEY = 'USAGE_COUNT_VISIBILITY';
    private static readonly SHOW_MAX_N_RESULTS_KEY = 'SHOW_MAX_N_RESULTS';
    private static readonly AUTO_COPY_FIRST_RESULT_KEY = 'AUTO_COPY_FIRST_RESULT';
    private static readonly COLOR_USERNAME_PROMPT_KEY = 'COLOR_USERNAME_PROMPT';
    private static readonly AUTOLOGIN_KEY = 'AUTO_LOGIN';
    private static readonly AUTOMERGE_KEY = 'AUTO_MERGE';

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
     * If true, the prompt for the username will have a yellow background (to prevent accidental password inputs there)
     */
    public get colorUsernamePrompt(): boolean {
        const visible = localStorage.getItem(Config.COLOR_USERNAME_PROMPT_KEY);
        return (visible !== 'false'); // default is true
    }

    public set colorUsernamePrompt(value: boolean) {
        localStorage.setItem(Config.COLOR_USERNAME_PROMPT_KEY, (value ? 'true' : 'false'));
    }

    /**
     * Immediately proposes to login when the UI starts
     */
    public get autoLogin(): boolean {
        const autoLogin = localStorage.getItem(Config.AUTOLOGIN_KEY);
        return (autoLogin !== 'false') && (this.defaultUserName !== '');
    }

    public set autoLogin(value: boolean) {
        localStorage.setItem(Config.AUTOLOGIN_KEY, (value ? 'true' : 'false'));
    }

    /**
     * Immediately proposes to login when the UI starts
     */
    public get autoMerge(): boolean {
        const autoMerge = localStorage.getItem(Config.AUTOMERGE_KEY);
        return (autoMerge === 'true');
    }

    public set autoMerge(value: boolean) {
        localStorage.setItem(Config.AUTOMERGE_KEY, (value ? 'true' : 'false'));
    }

    /**
     * Show usage count
     */
    public get usageCountVisibility(): boolean {
        const visible = localStorage.getItem(Config.USAGE_COUNT_VISIBILITY_KEY);
        return (visible === 'true');
    }

    public set usageCountVisibility(value: boolean) {
        localStorage.setItem(Config.USAGE_COUNT_VISIBILITY_KEY, (value ? 'true' : 'false'));
    }

    /**
     * Auto copy first result into clipboard
     */
    public get autoCopyFirstResult(): boolean {
        const enabled = localStorage.getItem(Config.AUTO_COPY_FIRST_RESULT_KEY);
        return (enabled === 'true');
    }

    public set autoCopyFirstResult(value: boolean) {
        localStorage.setItem(Config.AUTO_COPY_FIRST_RESULT_KEY, (value ? 'true' : 'false'));
    }

    /**
     * Truncates results to the top N, if N != -1
     */
    public get showAtMostNResults(): number {
        const n = localStorage.getItem(Config.SHOW_MAX_N_RESULTS_KEY);
        if (n == null) {
            return DEFAULT_MAX_NUMBER_OF_PASSWORD_RETURNED;
        }
        if (isNaN(Number(n))) {
            return DEFAULT_MAX_NUMBER_OF_PASSWORD_RETURNED;
        }
        return Number(n);
    }

    public set showAtMostNResults(value: number) {
        localStorage.setItem(Config.SHOW_MAX_N_RESULTS_KEY, value.toString());
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

    /**
     * Reset the value behing Config.key to its default value
     */
    public reset(key: keyof Config) {
        localStorage.setItem(Config[key], '');
    }
}
