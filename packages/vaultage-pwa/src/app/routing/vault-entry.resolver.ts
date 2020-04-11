import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { IVaultDBEntry } from 'vaultage-client';

import { AuthService } from '../auth.service';


@Injectable()
export class VaultEntryResolver implements Resolve<IVaultDBEntry> {

    constructor(
            private readonly authService: AuthService,
            private readonly router: Router) { }

    async resolve(route: ActivatedRouteSnapshot): Promise<IVaultDBEntry> {
        const id = route.paramMap.get('id');
        if (id == null) {
            throw new Error('No id parameter provided');
        }
        try {
            return this.authService.getVault().getEntry(id);
        } catch (e) {
            await this.router.navigate(['/manager']);
            throw e;
        }
      }
}
