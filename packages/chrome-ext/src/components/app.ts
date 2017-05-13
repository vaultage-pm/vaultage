import * as ng from 'angular';

interface IAppScope {
    controller: AppController
}

class AppController implements ng.IController {

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