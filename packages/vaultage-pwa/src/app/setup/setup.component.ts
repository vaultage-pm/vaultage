import { Component, OnInit } from '@angular/core';
import { SetupService } from './setup.service';

@Component({
    template: `
    <app-login *ngIf="step === 'login'"></app-login>
    <app-pin-setup *ngIf="step === 'set-pin'"></app-pin-setup>
`
})
export class SetupComponent implements OnInit {

    constructor(private readonly setupService: SetupService) { }

    ngOnInit() {
        this.setupService.doLogin();
    }

    public get step() {
        return this.setupService.step;
    }
}
