import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { RedirectService } from './redirect.service';

@Injectable()
export class AccessControlService {

    constructor(
            private readonly pinLockService: PinLockService,
            private readonly redirectService: RedirectService,
            private readonly authService: AuthService) {
    }

    public requestAccess(zone: AccessZone, currentUrl: string): boolean {
        const canAccess = this.canAccess(zone);
        if (!canAccess) {
            this.redirectService.redirectToAuthZone(currentUrl);
        }
        return canAccess;
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
}

export type AccessZone = 'unlock-screen' | 'manager' | 'setup';
