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
}
