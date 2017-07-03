import { ERROR_CODE } from '../../../js-sdk/vaultage';
import { StorageService } from '../services/storageService';
import { ErrorHandlerService } from '../services/errorHandlerService';
import { VaultService } from '../services/vaultService';
import { NotificationService } from '../services/notificationService';
import * as ng from 'angular';

interface ILoginScope extends ng.IScope {
    controller: LoginController;
}

class LoginController {

    public host: string = '';
    public username: string = '';
    public password: string = '';
    public isLoading: boolean = false;

    constructor(
            $scope: ILoginScope,
            private errorHandler: ErrorHandlerService,
            private vaultService: VaultService,
            private storageService: StorageService,
            private notificationService: NotificationService) {
        $scope.controller = this;
    
        let prefs = storageService.getLoginPreferences();
        if (prefs) {
            this.username = prefs.username;
            this.host = prefs.host;
        }
    }

    public logIn(): void {
        if (this.isLoading) {
            return;
        }
        this.storageService.storeLoginPreferences({
            username: this.username,
            host: this.host
        });
        let url = this._parseHost();
        this.isLoading = true;
        this.vaultService.login(url, this.username, this.password, (err) => {
            this.isLoading = false;
            if (err) {
                if (err.code == ERROR_CODE.NETWORK_ERROR) {
                    this.notificationService.notifyError(`Unable to contact server at: ${url}`);
                } else {
                    return this.errorHandler.handleVaultageError(err, () => this.logIn());
                }
            }
        });
    }

    private _parseHost(): string {
        let match = this.host.match(/(https?:\/\/)?([^:\/]+)(\:\d+)?(\/.+)?/);
        if (match) {
            let protocol = match[1] || 'https://';
            let host = match[2];
            let port = match[3] || ':443';
            let path = match[4] || '/';
            if (path.lastIndexOf('/') != path.length - 1) {
                path += '/';
            }
            return protocol + host + port + path + 'api/index.php';
        }
        return 'localhost:8080';
    }
}

export const LoginComponent = {
    templateUrl: 'templates/login-screen.html',
    controller: LoginController
};
