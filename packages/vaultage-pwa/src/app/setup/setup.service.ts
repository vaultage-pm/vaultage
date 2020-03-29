import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

    private credentialsNotifier?: (creds: LoginConfig) => void;
    private pinNotifier?: (pin: string) => void;

    constructor(
            private readonly snackBar: MatSnackBar,
            private readonly authService: AuthService,
            private readonly pinService: PinLockService,
            private readonly busyService: BusyStateService,
            private readonly errorHandler: ErrorHandlingService) {}

    public get step(): SetupStep {
        return this._step;
    }

    public async doLogin() {
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
        if (this.credentialsNotifier) {
            this.credentialsNotifier(credentials);
            this.credentialsNotifier = undefined;
        } else {
            this.errorHandler.onError('Not expected to receive credentials');
        }
    }

    private async promptCredentials(): Promise<LoginConfig> {
        this._step = 'login';
        return new Promise(resolve => {
            this.credentialsNotifier = resolve;
        });
    }

    public notifyPin(pin: string) {
        if (this.pinNotifier) {
            this.pinNotifier(pin);
            this.pinNotifier = undefined;
        } else {
            this.errorHandler.onError('Not expected to receive pin');
        }
    }

    private async promptPin(): Promise<string> {
        this._step = 'set-pin';
        return new Promise(resolve => {
            this.pinNotifier = resolve;
        });
    }
}

type SetupStep = 'login' | 'set-pin';


