import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AccessControlService } from './access-control.service';
import { AuthService } from './auth.service';
import { ErrorHandlingService } from './platform/error-handling.service';
import { RedirectService } from './redirect.service';

@Injectable()
export class AutoRedirectService {

    constructor(
            private readonly router: Router,
            private readonly redirectService: RedirectService,
            private readonly authService: AuthService) {
    }

    public init() {
        this.authService.authStatusChange$.subscribe(authenticated => {
            if (authenticated === false) {
                this.redirectService.redirectToAuthZone(this.router.routerState.snapshot.url);
            }
        });
    }
}
