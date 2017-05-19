import { NavigationService } from '../services/navigationService';
import { VaultService } from '../services/vaultService';
import * as ng from 'angular';

interface IContentScope extends ng.IScope {
    controller: ContentController;
}

class ContentController implements ng.IController {

    constructor(
            $scope: IContentScope,
            private navigation: NavigationService,
            public vaultService: VaultService) {
        $scope.controller = this;
    }

    public getCurrentPage(): string {
        return this.navigation.getCurrentPage();
    }

    public getPageData(key: string): string | null {
        let data = this.navigation.getPageData();
        if (data) {
            return data[key];
        }
        return null;
    }
}

export const ContentComponent = {
    templateUrl: 'templates/content.html',
    controller: ContentController
};
