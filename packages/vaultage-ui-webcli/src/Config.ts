import { IVaultageConfig } from 'vaultage-protocol';

import { Shell } from './webshell/Shell';

export const PWD_GEN_LENGTH = 16;
export const PWD_GEN_USE_SYMBOLS = false;
export const PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS = true;
export const PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING = true;

// TODO: This whole thing feels like a hack.
// Config specific to the web UI should live in the browser's localStorage
// OR there should be a clean API to register configuration that is specific
// to individual clients (like vaultage.getClientConfig('web-ui'))
export class Config {

    private defaultURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + location.pathname;

    private _pulledConfig?: IVaultageConfig;

    private _shell: Shell;

    constructor(shell: Shell) {
        this._shell = shell;
    }

    public pull(): boolean {

        try {
            $.get(this.defaultURL + 'config').then((data) => {
                    this._pulledConfig = (data as IVaultageConfig);
                }
            );
        } catch (e) {
            this._shell.echoError(e);
        }
        return true;
    }

    public getDefaultUserName(): string {
        if (this._pulledConfig && this._pulledConfig.default_user != null) {
            return this._pulledConfig.default_user;
        }
        return '';
    }
}
