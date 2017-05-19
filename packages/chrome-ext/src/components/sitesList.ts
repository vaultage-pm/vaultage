import { ErrorHandlerService } from '../services/errorHandlerService';
import { ClipboardService } from '../services/clipboardService';
import { NavigationService } from '../services/navigationService';
import { VaultService } from '../services/vaultService';
import { VaultDBEntry } from '../../../js-sdk/vaultage';
import * as ng from 'angular';

interface ISitesListScope extends ng.IScope {
    controller: SitesListController;
}

class SitesListController implements ng.IController {

    private _cachedList: VaultDBEntry[] = [];

    constructor(
            private errorHandler: ErrorHandlerService,
            private navigation: NavigationService,
            private vaultService: VaultService,
            private clipboard: ClipboardService,
            private $mdDialog: ng.material.IDialogService,
            $scope: ISitesListScope) {
        $scope.controller = this;
    }

    private _listIsDifferent(list: VaultDBEntry[]): boolean {
        return JSON.stringify(list) !== JSON.stringify(this._cachedList);
    }

    public getList(): VaultDBEntry[] {
        let newList = this.vaultService.getVault().getAllEntries();
        if (this._listIsDifferent(newList)) {
            this._cachedList = newList;
        }
        return this._cachedList;
    }

    public deleteItem(entry: VaultDBEntry): void {
        this.$mdDialog.show(
            this.$mdDialog.confirm()
                .title('For real?')
                .textContent('You are about to delete the entry "' + entry.title + '". Do you want to proceed?')
                .ok('Yes, delete')
                .cancel('No jk abort')
        ).then(() => this._deleteItemForSure(entry));
    }

    private _deleteItemForSure(entry: VaultDBEntry): void {
        this.vaultService.delete(entry.id, (err) => {
            if (err) {
                this.errorHandler.handleVaultageError(err, () => this._deleteItemForSure(entry));
            }
            console.log('TODO: Show progress and then success');
        });
    }

    public editItem(site: VaultDBEntry): void {
        this.navigation.editSite(site.id);
    }

    public mainItemAction(site: VaultDBEntry): void {
        chrome.tabs.create({url: site.url });
    }

    public copyPassword(site: VaultDBEntry): void {
        this.clipboard.copy(site.password);
    }

    public copyUsername(site: VaultDBEntry): void {
        this.clipboard.copy(site.login);
    }
}

export const SitesListComponent = {
    templateUrl: 'templates/sites-list.html',
    controller: SitesListController
};
