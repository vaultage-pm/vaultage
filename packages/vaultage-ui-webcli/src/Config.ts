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
    private static readonly AUTO_COPY_FIRST_RESULT = 'AUTO_COPY_FIRST_RESULT';
    private static readonly COLOR_USERNAME_PROMPT = 'COLOR_USERNAME_PROMPT';

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

    /**
     * If true, the prompt for the username will have a yellow background (to prevent accidental password inputs there)
     */
    public get colorUsernamePrompt(): boolean {
        const visible = localStorage.getItem(Config.COLOR_USERNAME_PROMPT);
        return (visible !== 'false'); // default is true
    }

    /**
     * Show usage count
     */
    public get usageCountVisibility(): boolean {
        const visible = localStorage.getItem(Config.USAGE_COUNT_VISIBILITY);
        return (visible === 'true');
    }

    /**
     * Auto copy first result into clipboard
     */
    public get autoCopyFirstResult(): boolean {
        const enabled = localStorage.getItem(Config.AUTO_COPY_FIRST_RESULT);
        return (enabled === 'true');
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

    /**
     * Reset the value behing Config.key to its default value
     */
    public reset(key: keyof Config) {
        localStorage.setItem(Config[key], '');
    }


    /**
     * Sets the value behing Config.key to value
     */
    public write(key: keyof Config, value: string | number | boolean) {

        if (typeof this[key] === 'boolean') {
            localStorage.setItem(key, String(value));
        } else if (typeof this[key] === 'string') {
            localStorage.setItem(key, (value ? 'true' : 'false'));
        } else if (typeof this[key] === 'number') {
            localStorage.setItem(key, String(value));
        }
    }
}
