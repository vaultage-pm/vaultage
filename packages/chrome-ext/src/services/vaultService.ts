import { BackgroundPage } from '../interfaces/BackgroundPage';
import { Vault, VaultageError, VaultDBEntryAttrs } from '../../../js-sdk/vaultage';

export type VaultServiceCallback = (err: VaultageError | null) => void;

export class VaultService {

    private _bgPage: BackgroundPage | null = chrome.extension.getBackgroundPage() as any;

    constructor(
            private $rootScope: ng.IRootScopeService) {
    }

    public getVault(): Vault {
        if (!this._bgPage) throw new Error('Extension cannot access background page');
        return this._bgPage.vault;
    }

    private _vaultAsyncCb(userCB: VaultServiceCallback): VaultServiceCallback {
        return (err) => {
            this.$rootScope.$apply(() => {
                userCB(err);
            });
        };
    }


    // State mutators

    public login(url: string, username: string, password: string, cb: VaultServiceCallback): void {
        try {
            this.getVault().auth(url, username, password, this._vaultAsyncCb(cb));
        } catch (e) {
            cb(e);
        }
    }

    public logout(cb: VaultServiceCallback): void {
        try {
            this.getVault().unauth();
            cb(null);
        } catch (e) {
            cb(e);
        }
    }

    public refresh(cb: VaultServiceCallback): void {
        try {
            this.getVault().refresh(this._vaultAsyncCb(cb));
        } catch (e) {
            cb(e);
        }
    }

    public delete(id: string, cb: VaultServiceCallback): void {
        try {
            let vault = this.getVault();
            vault.removeEntry(id);
            vault.save(this._vaultAsyncCb(cb));
        } catch (e) {
            cb(e);
        }
    }

    public create(attrs: VaultDBEntryAttrs, cb: VaultServiceCallback): void {
        try {
            let vault = this.getVault();
            vault.addEntry(attrs);
            vault.save(this._vaultAsyncCb(cb));
        } catch (e) {
            cb(e);
        }
    }

    public update(id: string, attrs: VaultDBEntryAttrs, cb: VaultServiceCallback): void {
        try {
            let vault = this.getVault();
            vault.updateEntry(id, attrs);
            vault.save(this._vaultAsyncCb(cb));
        } catch (e) {
            cb(e);
        }
    }
}