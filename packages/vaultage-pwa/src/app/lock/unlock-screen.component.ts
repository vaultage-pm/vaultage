import { Component } from '@angular/core';

import { AuthService } from '../auth.service';

@Component({
    selector: 'app-unlock-screen',
    template: `<app-pin-code (confirm)="onSubmit($event)"></app-pin-code>`
})
export class UnlockScreenComponent {

    constructor(
            private readonly authService: AuthService) { }

    onSubmit(pin: string) {
        this.authService.unlock(pin);
    }
}
