import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class LockScreenGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    canActivate(
            next: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): boolean {
        return this.authService.requestAccess('unlock-screen', state.url);
    }
}
