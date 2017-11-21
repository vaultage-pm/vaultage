import { ISaltsConfig } from 'vaultage-client';

import { IVaultageConfig } from '../../vaultage/src/VaultageConfig';
import * as lang from './lang';
import { Shell } from './webshell/Shell';

export const PWD_GEN_LENGTH = 16;
export const PWD_GEN_USE_SYMBOLS = false;
export const PWG_GEN_AVOID_VISUALLY_SIMILAR_CHARS = true;
export const PWD_GEN_AVOID_PUNCTUATION_USED_IN_PROGRAMMING = true;

export class Config {

    private defaultURL;

    private _pulledConfig: IVaultageConfig;

    private _shell: Shell;

    constructor(shell: Shell) {
        this.defaultURL = location.protocol + '//' + location.hostname +
             (location.port ? ':' + location.port : '') + location.pathname;
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
        if (this._pulledConfig.default_user != null) {
            return this._pulledConfig.default_user;
        }
        return '';
    }

    public getSalts(): ISaltsConfig {
        if (this._pulledConfig.salts != null) {
            return this._pulledConfig.salts;
        }

        $.ajax({
            async: false,
            type: 'GET',
            url: this.defaultURL + 'config',
            success: (data) => {
                this._pulledConfig = (data as IVaultageConfig);
                return this._pulledConfig.salts;
            }
        });

        throw new Error(lang.ERR_NO_SALTS);
    }
}
