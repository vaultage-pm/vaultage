import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { AuthService, LoginConfig } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';


@Injectable()
/**
 * Handles the logic of the account setup process.
 */
export class SetupService {

    private _step: SetupStep = 'login';

    private credentialsNotifier = new Subject<LoginConfig>();
    private pinNotifier = new Subject<string>();

    constructor(
            private readonly router: Router,
            private readonly snackBar: MatSnackBar,
            private readonly authService: AuthService,
            private readonly pinService: PinLockService,
            private readonly busyService: BusyStateService,
            private readonly errorHandler: ErrorHandlingService) {}

    public get step(): SetupStep {
        return this._step;
    }

    public doLogin() {
        this._doLogin()
            .catch(err => {
                this.errorHandler.onError(err);
                this.router.navigate(['/manager']).catch(this.errorHandler.onError);
            });
    }

    private async _doLogin() {
        const credentials = await this.getCredentials();
        const pin = await this.promptPin();

        this.busyService.setBusy(true);
        try {
            this.pinService.setSecret(pin, JSON.stringify(credentials));
            await this.authService.logIn(credentials, pin);
        } finally {
            this.busyService.setBusy(false);
        }
    }

    private async getCredentials(): Promise<LoginConfig> {
        while (true) {
            const credentials = await this.promptCredentials();
            this.busyService.setBusy(true);
            try {
                await this.authService.testCredentials(credentials);
                return credentials;
            } catch (e) {
                this.snackBar.open(e.message);
                this.errorHandler.onError(e);
            } finally {
                this.busyService.setBusy(false);
            }
        }
    }

    public notifyCredentials(credentials: LoginConfig) {
        this.credentialsNotifier.next(credentials);
    }

    private async promptCredentials(): Promise<LoginConfig> {
        this._step = 'login';
        return this.credentialsNotifier.pipe(first()).toPromise();
    }

    public notifyPin(pin: string) {
        this.pinNotifier.next(pin);
    }

    private async promptPin(): Promise<string> {
        this._step = 'set-pin';
        return this.pinNotifier.pipe(first()).toPromise();
    }
}

export type SetupStep = 'login' | 'set-pin';
