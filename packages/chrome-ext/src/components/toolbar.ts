import { ErrorHandlerService } from '../services/errorHandlerService';
import { NavigationService } from '../services/navigationService';
import { VaultService } from '../services/vaultService';
import * as ng from 'angular';

interface IToolbarScope {
    controller: ToolbarController
}

class ToolbarController implements ng.IController {

    constructor(
            private errorHandler: ErrorHandlerService,
            private vaultService: VaultService,
            private navigation: NavigationService,
            $scope: IToolbarScope) {
        $scope.controller = this;
    }

    public refresh(): void {
        this.vaultService.refresh((err) => {
            if (err) {
                this.errorHandler.handleVaultageError(err, () => this.refresh());
            }
        });
    }

    public logOut(): void {
        this.vaultService.logout((err) => {
            if (err) {
                this.errorHandler.handleVaultageError(err, () => null);
            }
        });
    }

    public isLoggedIn(): boolean {
        return this.vaultService.getVault().isAuth();
    }

    public createSite(): void {
        this.navigation.createSite();
    }

    public canGoBack(): boolean {
        return this.navigation.canGoBack();
    }

    public goBack(): void {
        return this.navigation.goBack();
    }
}

export const ToolbarComponent = {
    templateUrl: 'templates/toolbar.html',
    controller: ToolbarController
};