import * as ng from 'angular';

interface IAppScope extends ng.IScope {
    controller: AppController
}

class AppController {

    constructor(
            $scope: IAppScope) {
        $scope.controller = this;
    }

    public isLoggedIn(): boolean {
        return false;
    }
}

export const AppComponent = {
    templateUrl: 'templates/app.html',
    controller: AppController
};