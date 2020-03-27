import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly authService: AuthService) {}

    canActivate(
            next: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): boolean {
        return this.authService.requestAccess('manager', state.url);
    }
}
