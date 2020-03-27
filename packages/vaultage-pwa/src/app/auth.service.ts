import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import vaultage, { Vault } from 'vaultage-client';

import { PinLockService } from './platform/pin-lock.service';
import { BusyStateService } from './platform/busy-state.service';

/**
 * Manages application access rights.
 */
@Injectable()
export class AuthService {

    private get loggedIn() {
        return this.pinLockService.hasSecret;
    }

    private vault?: Vault;

    constructor(
            private readonly busy: BusyStateService,
            private readonly pinLockService: PinLockService,
            private readonly route: ActivatedRoute,
            private readonly router: Router) {
    }

    public get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    public get isLocked(): boolean {
        return this.loggedIn && this.vault == null;
    }

    public requestAccess(zone: AccessZone, currentUrl: string): boolean {
        const canAccess = this.canAccess(zone);
        if (!canAccess) {
            this.redirectAfterError(currentUrl);
        }
        return canAccess;
    }

    /**
     * Tests the given credentials.
     * @return a promise which completes on success and fails on error
     */
    public async testCredentials(config: LoginConfig) {
        await this.doLogin(config);
    }

    /**
     * Saves authentication settings
     */
    public async logIn(data: LoginConfig, pin: string) {
        this.vault = await this.doLogin(data);
        this.pinLockService.setSecret(pin, JSON.stringify(data));

        this.router.navigate(['/manager'], { replaceUrl: true });
    }

    /**
     * Clears authentication settings
     */
    public logOut() {
        this.pinLockService.reset();
        this.vault = undefined;
        this.router.navigate(['/setup'], { replaceUrl: true });
    }

    /**
     * Locks the app
     */
    public lock() {
        this.vault = undefined;
        this.router.navigate(['/unlock'], { replaceUrl: true });
    }

    /**
     * Unlocks the app
     */
    public unlock(pin: string) {
        this.busy.setBusy(true);
        return this._unlock(pin)
            .finally(() => this.busy.setBusy(false));
    }

    /**
     * Returns a promise which resolves with the vault if the app is authenticated.
     * @throws if the app is not authenticated
     */
    public getVault(): Vault {
        if (this.vault) {
            return this.vault;
        }
        this.redirectAfterError(this.router.routerState.snapshot.url);
        throw new Error('App is not authenticated');
    }

    private async _unlock(pin: string) {
        const data = this.pinLockService.getSecret(pin);
        if (data != null) {
            this.vault = await this.doLogin(JSON.parse(data));

            const nextURL = this.route.snapshot.queryParamMap.get('next') ?? '/manager';
            await this.router.navigate([nextURL], { replaceUrl: true });
        }
    }

    private canAccess(zone: AccessZone): boolean {
        switch (zone) {
            case 'manager':
                return this.isLoggedIn && !this.isLocked;
            case 'setup':
                return !this.isLoggedIn;
            case 'unlock-screen':
                return this.isLoggedIn && this.isLocked;
        }
    }

    private doLogin(config: LoginConfig): Promise<Vault> {
        return vaultage.login(config.url, config.username, config.password, {
            auth: config.basic
        });
    }

    /**
     * Redirects to the appropriate page after an authentication error occured.
     *
     * @param next url which was being accessed when the error occured
     */
    private redirectAfterError(next: string) {
        if (!this.isLoggedIn) {
            this.router.navigate(['setup']);
        } else if (this.isLocked) {
            this.router.navigate(['unlock'], { queryParams: { next }});
        } else {
            this.router.navigate(['manager']);
        }
    }
}

export interface AuthData {
    loginConfig: LoginConfig;
    pin: string;
}

export type AccessZone = 'unlock-screen' | 'manager' | 'setup';

export type AppState = 'unauthenticated' | 'locked' | 'unlocked';

export interface LoginConfig {
    username: string;
    password: string;
    url: string;
    basic?: {
        username: string;
        password: string;
    };
}
