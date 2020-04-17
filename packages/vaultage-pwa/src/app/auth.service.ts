import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vault, Vaultage } from 'vaultage-client';
import { PinLockService } from './pin-lock.service';
import { VAULTAGE } from './platform/providers';


/**
 * Manages application access rights.
 */
@Injectable()
export class AuthService {

    private readonly vaultSubject = new BehaviorSubject<Vault | null>(null);
    public readonly authStatusChange$: Observable<boolean> = this.vaultSubject.pipe(map(v => v != null));

    constructor(
            private readonly pinLockService: PinLockService,
            private readonly router: Router,
            @Inject(VAULTAGE) private readonly vaultage: Vaultage) {
    }

    public get isAuthenticated(): boolean {
        return this.vaultSubject.value != null;
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
    public async logIn(data: LoginConfig, pin: string, nextURL?: string) {
        this.vaultSubject.next(await this.doLogin(data));
        this.pinLockService.setSecret(pin, JSON.stringify(data));

        await this.router.navigateByUrl(nextURL ?? '/manager', { replaceUrl: true });
    }

    /**
     * Clears authentication settings
     */
    public logOut() {
        this.vaultSubject.next(null);
    }

    /**
     * Returns a promise which resolves with the vault if the app is authenticated.
     * @throws if the app is not authenticated
     */
    public getVault(): Vault {
        const vault = this.vaultSubject.value;
        if (vault) {
            return vault;
        }
        throw new Error('App is not authenticated');
    }

    private doLogin(config: LoginConfig): Promise<Vault> {
        return this.vaultage.login(config.url, config.username, config.password, {
            auth: config.basic
        });
    }
}

export interface AuthData {
    loginConfig: LoginConfig;
    pin: string;
}


export interface LoginConfig {
    username: string;
    password: string;
    url: string;
    basic?: {
        username: string;
        password: string;
    };
}
