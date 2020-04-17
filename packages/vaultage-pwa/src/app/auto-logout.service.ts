import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class AutoLogoutService {

    private started = false;

    constructor(
            @Inject(DOCUMENT) private readonly document: Document,
            private readonly authService: AuthService) {
    }

    public init() {
        if (this.started) {
            console.warn('AutoLogoutService has already been initialized');
            return;
        }
        this.started = true;

        /*
         *   Automatically log user out when navigating away from the app.
         */
        this.document.addEventListener('visibilitychange', () => {
            if (this.document.hidden) {
                this.authService.logOut();
            }
        });
    }
}
