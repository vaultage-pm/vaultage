import { VaultService } from '../services/vaultService';
import * as ng from 'angular';

interface ILoginScope extends ng.IScope {
    controller: LoginController;
}

class LoginController implements ng.IController {

    public host: string = 'localhost:8080';
    public username: string = 'demo';
    public password: string = 'demo2';
    public isLoading: boolean = false;

    constructor(
            $scope: ILoginScope,
            private vault: VaultService) {
        $scope.controller = this;
    }

    public logIn() {
        if (this.isLoading) {
            return;
        }
        let url = 'http://' + this.host + '/api/index.php';
        this.isLoading = true;
        this.vault.login(url, this.username, this.password,(err) => {
            this.isLoading = false;
            if (err) throw err; // TODO: proper error handling
        });
    }
}

export const LoginComponent = {
    templateUrl: 'templates/login-screen.html',
    controller: LoginController
};
