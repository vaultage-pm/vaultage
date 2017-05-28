import { NavigationService } from './navigationService';

export type TfaPromptCb = (token: string) => void;

export class TfaPromptService {

    private _pendingCb?: TfaPromptCb;

    constructor(private navigation: NavigationService) { }

    public prompt(cb: TfaPromptCb) {
        this._pendingCb = cb;
        this.navigation.promptForTFA();
    }

    public returnFromPrompt(token: string) {
        if (this._pendingCb) {
            this.navigation.goBack();
            this._pendingCb(token);
            delete this._pendingCb;
        }
    }
}