import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';

import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';


@Injectable()
/**
 * Handles the logic of the account setup process.
 */
export class SetupService {

    private currentStep: SetupStep = 'login';

    constructor(
            private readonly router: Router,
            private readonly busyService: BusyStateService,
            private readonly errorHandler: ErrorHandlingService) {}

    public get step(): SetupStep {
        return this.currentStep;
    }

    public login(credentials: LoginConfig): void {
        this.busyService.setBusy(true);
        this._login(credentials).finally(() => {
            this.busyService.setBusy(false);
        }).catch(e => this.errorHandler.onError(e));
    }

    private async _login(credentials: LoginConfig) {
        await timer(1000).toPromise();
        this.currentStep = 'set-pin';
    }

    public choseNewPin(pin: string): void {
        this.router.navigate(['/home'], {
            replaceUrl: true
        });
    }
}

type SetupStep = 'login' | 'set-pin';

export interface LoginConfig {
    username: string;
    password: string;
    host: string;
    basic?: {
        username: string;
        password: string;
    };
}
