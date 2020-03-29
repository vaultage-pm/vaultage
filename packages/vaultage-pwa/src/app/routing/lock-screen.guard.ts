import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { AccessControlService } from '../access-control.service';

@Injectable()
export class LockScreenGuard implements CanActivate {
    constructor(private readonly accessControl: AccessControlService) {}

    canActivate(
            next: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): boolean {
        return this.accessControl.requestAccess('unlock-screen', state.url);
    }
}
