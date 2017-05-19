import { ErrorHandlerService } from '../services/errorHandlerService';
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
            private errorHandler: ErrorHandlerService,
            private vaultService: VaultService,
            private navigation: NavigationService,
            $scope: ISiteFormScope) {
        $scope.controller = this;
        if (this.siteId != null) {
            let entry = this.vaultService.getVault().getEntry(this.siteId);
            if (entry != null) {
                this.entry = entry;
            }
        }
    }


    public submit(): void {
        this.isLoading = true;
        if (this.siteId == null) { // Create
            this.vaultService.create(this.entry, this._submitCb);
        } else { // Update
            this.vaultService.update(this.siteId, this.entry, this._submitCb);
        }
    }

    private _submitCb = (err: VaultageError | null) => {
        this.isLoading = false;
        this.navigation.goHome();
        if (err) {
            this.errorHandler.handleVaultageError(err, () => this.submit());
        }
    }
}

export const SiteFormComponent = {
    templateUrl: 'templates/site-form.html',
    controller: SiteFormController,
    bindings: {
        siteId: '<?'
    }
};
