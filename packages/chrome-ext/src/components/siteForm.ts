import { NavigationService } from '../services/navigationService';
import { VaultageError, VaultDBEntryAttrs } from '../../../js-sdk/vaultage';
import { VaultService } from '../services/vaultService';
import * as ng from 'angular';

interface ISiteFormScope extends ng.IScope {
    controller: SiteFormController;
}

class SiteFormController implements ng.IController {

    public isLoading: boolean = false;
    public entry: VaultDBEntryAttrs = {};

    private siteId: string | undefined;

    constructor(
            private vault: VaultService,
            private navigation: NavigationService,
            $scope: ISiteFormScope) {
        $scope.controller = this;
        if (this.siteId != null) {
            let entry = this.vault.getVault().getEntry(this.siteId);
            if (entry != null) {
                this.entry = entry;
            }
        }
    }


    public submit(): void {
        this.isLoading = true;
        if (this.siteId == null) { // Create
            this.vault.create(this.entry, this._submitCb);
        } else { // Update
            this.vault.update(this.siteId, this.entry, this._submitCb);
        }
    }

    private _submitCb = (err: VaultageError | null) => {
        this.isLoading = false;
        this.navigation.goHome();
        if (err) console.error(err);
    }
}

export const SiteFormComponent = {
    templateUrl: 'templates/site-form.html',
    controller: SiteFormController,
    bindings: {
        siteId: '<?'
    }
};
