import { Vault } from 'vaultage-client';
import * as lang from './lang';

export class Context {

    private _vault: Vault | null = null;

    /**
     * Returns true if the context is currently authenticated
     */
    public isAuthenticated(): boolean {
        return this._vault !== null;
    }

    /**
     * The current Vault.
     *
     * Attempting to access it when the context is not authenticated throws an exception.
     * Setting the value to a new vault causes the context to become authenticated.
     */
    public get vault(): Vault {
        if (this._vault == null) {
            throw new Error(lang.ERR_NOT_AUTHENTICATED);
        }
        return this._vault;
    }

    public set vault(vault: Vault) {
        this._vault = vault;
    }

    /**
     * Causes the context to become unauthenticated. Further attempts to get the `vault`
     * property throw an error.
     */
    public unsetVault() {
        this._vault = null;
    }
}
