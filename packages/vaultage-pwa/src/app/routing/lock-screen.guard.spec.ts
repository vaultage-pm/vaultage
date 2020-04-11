import { RouterStateSnapshot } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
import { mockInstance, when } from 'omnimock';

import { AccessControlService } from '../access-control.service';
import { LockScreenGuard } from './lock-screen.guard';

describe('LockScreenGuard', () => {

    let guard: LockScreenGuard;

    beforeEach(() => {
        guard = getService(LockScreenGuard);
    });

    it('delegates to accessControlService', () => {
        const reply = mockInstance<boolean>('reply');
        when(getMock(AccessControlService).requestAccess('unlock-screen', 'the-url')).return(reply).once();
        guard.canActivate(mockInstance('state'), mockInstance(RouterStateSnapshot, {
            url: 'the-url'
        }));
        expect().nothing();
    });
});
