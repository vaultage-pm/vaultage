import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccessControlService } from '../access-control.service';
import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';

@Component({
    selector: 'app-unlock-screen',
    template: `<app-pin-code
            (confirm)="onSubmit($event)"
            [errorMessage]="error"
            altActionName="< Log out"
            (altAction)="onLogOut()">
        </app-pin-code>`
})
export class UnlockScreenComponent {

    public error: string | null = null;

    constructor(
            private readonly accessControlService: AccessControlService,
            private readonly route: ActivatedRoute,
            private readonly busy: BusyStateService,
            private readonly pinLockService: PinLockService,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly authService: AuthService) { }

    public onSubmit(pin: string) {
        this.busy.setBusy(true);
        this._unlock(pin)
            .finally(() => this.busy.setBusy(false))
            .catch(e => {
                this.error = e.message;
                this.errorHandlingService.onError(e);
            });
    }

    public onLogOut() {
        this.pinLockService.reset();
        this.accessControlService.redirectOnAuthChange(this.route.snapshot.url.join('/'))
            .catch(e => this.errorHandlingService.onError(e));
    }

    private async _unlock(pin: string) {
        if (!this.pinLockService.hasSecret) {
            this.accessControlService.redirectOnAuthChange(this.route.snapshot.url.join('/'))
                .catch(e => this.errorHandlingService.onError(e));
        }
        const data = this.pinLockService.getSecret(pin);
        if (data == null) {
            throw new Error('Invalid pin');
            return;
        }

        const nextURL = this.route.snapshot.queryParamMap.get('next') ?? undefined;
        await this.authService.logIn(JSON.parse(data), pin, nextURL);
    }
}
