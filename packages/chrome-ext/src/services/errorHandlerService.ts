import { NotificationService } from './notificationService';
import { VaultService } from './vaultService';
import { TfaPromptService } from './tfaPromptService';
import { ERROR_CODE, VaultageError } from '../../../js-sdk/vaultage';

type RetryCb = () => void;

export class ErrorHandlerService {

    constructor(
            private vaultService: VaultService,
            private tfaPromptService: TfaPromptService,
            private notificationService: NotificationService) {
    }


    public handleVaultageError(err: VaultageError, retry: RetryCb) {
        if (err.code == ERROR_CODE.TFA_FAILED) {
            this.tfaPromptService.prompt((token) => {
                this.vaultService.getVault().setTFAConfig({method: 'totp', request: token});
                retry();
            });
        } else {
            this.notificationService.notifyError(err.toString());
        }
    }
}