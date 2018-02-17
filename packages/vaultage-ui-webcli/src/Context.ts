import { Vault } from 'vaultage-client';
import * as lang from './lang';

export class Context {

    private _vault: Vault | null = null;

    public get vault(): Vault {
        if (this._vault == null) {
            throw new Error(lang.ERR_NOT_AUTHENTICATED);
        }
        return this._vault;
    }

    public set vault(vault: Vault) {
        this._vault = vault;
    }

    public unsetVault() {
        this._vault = null;
    }
}
