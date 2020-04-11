import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
import { instance, mock, mockInstance, when } from 'omnimock';
import { IVaultDBEntry } from 'vaultage-client';

import { AuthService } from '../auth.service';
import { VaultEntryResolver } from './vault-entry.resolver';

describe('VaultEntryResolver', () => {

    let service: VaultEntryResolver;

    beforeEach(() => {
        service = getService(VaultEntryResolver);
    });

    it('resolves a vault entry', async () => {
        const fakeEntry = mockInstance<IVaultDBEntry>('fakeEntry');
        when(getMock(AuthService).getVault().getEntry('12')).return(fakeEntry).once();
        const mockRoute = mock(ActivatedRouteSnapshot);
        when(mockRoute.paramMap.get('id')).return('12').once();

        expect(await service.resolve(instance(mockRoute))).toBe(fakeEntry);
    });

    it('rejects when no id provided', async () => {
        const mockRoute = mock(ActivatedRouteSnapshot);
        when(mockRoute.paramMap.get('id')).return(null).once();

        try {
            await service.resolve(instance(mockRoute));
            fail('should have rejected');
        } catch (e) {
            expect(e.message).toMatch(/No id/);
        }
    });

    it('rejects when there is no entry', async () => {
        when(getMock(AuthService).getVault().getEntry('12')).throw(new Error('No such entry')).once();
        const mockRoute = mock(ActivatedRouteSnapshot);
        when(mockRoute.paramMap.get('id')).return('12').once();
        when(getMock(Router).navigate(['/manager'])).resolve(true).once();

        try {
            await service.resolve(instance(mockRoute));
            fail('should have rejected');
        } catch (e) {
            expect(e.message).toMatch(/No such entry/);
        }
    });
});
