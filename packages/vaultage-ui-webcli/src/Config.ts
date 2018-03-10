export const PWD_GEN_LENGTH = 16;
export const PWD_GEN_USE_SYMBOLS = false;
export const PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS = true;
export const PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING = true;


/**
 * Configuration settings of the webui client application.
 */
export class Config {

    private static readonly USERNAME_KEY = 'DEFAULT_USERNAME';

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
}
