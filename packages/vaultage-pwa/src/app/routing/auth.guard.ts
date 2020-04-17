import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { AccessControlService } from '../access-control.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly accessControl: AccessControlService) {}

    canActivate(
            next: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): boolean {
        return this.accessControl.requestAccess('manager', state.url);
    }
}
