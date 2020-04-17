import { Component } from '@angular/core';
import { SetupService } from './setup.service';

@Component({
    selector: 'app-pin-setup',
    templateUrl: 'pin-setup.component.html',
    styleUrls: ['pin-setup.component.scss']
})
export class PinSetupComponent {

    public step: PinSetupStep = 'compose';

    public composedPin: string = '';

    public errorMessage: string = '';

    constructor(private readonly setupService: SetupService) {}

    public onCompose(pin: string) {
        this.errorMessage = '';
        this.step = 'confirm';
        this.composedPin = pin;
    }

    public onConfirm(pin: string) {
        if (pin === this.composedPin) {
            this.setupService.notifyPin(pin);
        } else {
            this.errorMessage = 'Pins did not match';
            this.step = 'compose';
        }
    }
}

type PinSetupStep = 'compose' | 'confirm';
