import { TfaPromptService } from '../services/tfaPromptService';
import * as ng from 'angular';

interface ITfaPromptScope extends ng.IScope {
    controller: TfaPromptController;
}

class TfaPromptController implements ng.IController {

    private token: string = "";

    constructor(
            private tfaPromptService: TfaPromptService,
            $scope: ITfaPromptScope) {
        $scope.controller = this;
    }

    public submit(): void {
        this.tfaPromptService.returnFromPrompt(this.token);
    }
}

export const TfaPromptComponent = {
    templateUrl: 'templates/tfa-prompt.html',
    controller: TfaPromptController
};