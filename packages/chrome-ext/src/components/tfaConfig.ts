import { NavigationService } from '../services/navigationService';
import { ErrorHandlerService } from '../services/errorHandlerService';
import { VaultService } from '../services/vaultService';
import * as ng from 'angular';
import * as QRCode from 'qrcode-svg';

interface ITfaConfigScope extends ng.IScope {
    controller: TfaConfigController;
}

class TfaConfigController implements ng.IController {

    public provisioningURI: string = '';
    public provisioningQRCode: string = '';
    public confirmationPIN: string = '';

    constructor(
            private $sce: ng.ISCEService,
            private errorHandler: ErrorHandlerService,
            private vaultService: VaultService,
            private navigation: NavigationService,
            $scope: ITfaConfigScope) {
        $scope.controller = this;
    }

    public requestSetup(): void {
        this.vaultService.requestTFASetup((err, data) => {
            if (err) {
                return this.errorHandler.handleVaultageError(err, () => this.requestSetup());
            }
            if (data) {

                this.provisioningURI = data.provisioningURI;
                console.log(this.provisioningURI);
                this.provisioningQRCode = this.$sce.trustAsHtml((new QRCode(this.provisioningURI)).svg());
            }
        });
    }

    public submit() {
        this.vaultService.confirmTFASetup({
            pin: this.confirmationPIN
        }, (err) => {
            if (err) {
                return this.errorHandler.handleVaultageError(err, () => this.submit());
            }
            this.navigation.goBack();
        });
    }
}

export const TfaConfigComponent = {
    templateUrl: 'templates/tfa-config.html',
    controller: TfaConfigController
};