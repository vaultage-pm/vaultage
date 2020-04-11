import { RouterStateSnapshot } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
import { mockInstance, when } from 'omnimock';

import { AccessControlService } from '../access-control.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {

    let guard: AuthGuard;

    beforeEach(() => {
        guard = getService(AuthGuard);
    });

    it('delegates to accessControlService', () => {
        const reply = mockInstance<boolean>('reply');
        when(getMock(AccessControlService).requestAccess('manager', 'the-url')).return(reply).once();
        guard.canActivate(mockInstance('state'), mockInstance(RouterStateSnapshot, {
            url: 'the-url'
        }));
        expect().nothing();
    });
});
