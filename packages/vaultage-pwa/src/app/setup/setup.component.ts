import { Component } from '@angular/core';
import { SetupService } from './setup.service';

@Component({
    template: `
    <app-login *ngIf="step === 'login'"></app-login>
    <app-pin-setup *ngIf="step === 'set-pin'"></app-pin-setup>
`
})
export class SetupComponent {

    constructor(private readonly setupService: SetupService) { }

    public get step() {
        return this.setupService.step;
    }
}
