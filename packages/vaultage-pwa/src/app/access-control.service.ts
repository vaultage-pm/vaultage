import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { ErrorHandlingService } from './platform/error-handling.service';


@Injectable()
export class AccessControlService {

    constructor(
            private readonly router: Router,
            private readonly pinLockService: PinLockService,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly authService: AuthService) {
        this.authService.authStatusChange$.subscribe(authenticated => {
            if (authenticated === false) {
                this.redirectOnAuthChange(this.router.routerState.snapshot.url)
                        .catch(e => this.errorHandlingService.onError(e));
            }
        });
    }

    private canAccess(zone: AccessZone): boolean {
        switch (zone) {
            case 'manager':
                return this.authService.isAuthenticated;
            case 'setup':
                return !this.authService.isAuthenticated && !this.pinLockService.hasSecret;
            case 'unlock-screen':
                return !this.authService.isAuthenticated && this.pinLockService.hasSecret;
        }
    }

    public requestAccess(zone: AccessZone, currentUrl: string): boolean {
        const canAccess = this.canAccess(zone);
        if (!canAccess) {
            this.redirectOnAuthChange(currentUrl)
                    .catch(e => this.errorHandlingService.onError(e));
        }
        return canAccess;
    }

    /**
     * Redirects to the appropriate page after an authentication error occured.
     *
     * @param next url which was being accessed when the error occured
     * @returns a promise that:
     * - resolves to 'true' when navigation succeeds,
     * - resolves to 'false' when navigation fails,
     * - is rejected when an error happens.
     */
    public redirectOnAuthChange(next: string): Promise<boolean> {
        if (!this.authService.isAuthenticated && !this.pinLockService.hasSecret) {
            return this.router.navigate(['setup']);
        } else if (!this.authService.isAuthenticated) {
            return this.router.navigate(['unlock'], { queryParams: { next }});
        } else {
            return this.router.navigate(['manager']);
        }
    }
}


export type AccessZone = 'unlock-screen' | 'manager' | 'setup';
