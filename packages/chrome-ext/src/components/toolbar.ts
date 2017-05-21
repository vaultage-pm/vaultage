import { NavigationService } from '../services/navigationService';
import { VaultService } from '../services/vaultService';
import * as ng from 'angular';

interface IToolbarScope {
    controller: ToolbarController
}

class ToolbarController implements ng.IController {

    constructor(
            private vault: VaultService,
            private navigation: NavigationService,
            $scope: IToolbarScope) {
        $scope.controller = this;
    }

    public refresh(): void {
        this.vault.refresh((err) => {
            if (err) throw err; // TODO: better error handling
        });
    }

    public logOut(): void {
        this.vault.logout((err) => {
            if (err) throw err; // TODO: better error handling
        });
    }

    public isLoggedIn(): boolean {
        return this.vault.getVault().isAuth();
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