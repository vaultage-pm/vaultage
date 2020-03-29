import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { IVaultDBEntry } from 'vaultage-client';


@Injectable()
export class VaultEntryResolver implements Resolve<IVaultDBEntry> {

    constructor(
            private readonly authService: AuthService,
            private readonly router: Router) { }

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<IVaultDBEntry> {
        const id = route.paramMap.get('id') ?? '';
        try {
            return this.authService.getVault().getEntry(id);
        } catch (e) {
            await this.router.navigate(['/manager']);
            throw e;
        }
      }
}
