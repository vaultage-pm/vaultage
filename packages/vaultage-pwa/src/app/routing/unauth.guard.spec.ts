import { RouterStateSnapshot } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
import { mockInstance, when } from 'omnimock';

import { AccessControlService } from '../access-control.service';
import { UnauthGuard } from './unauth.guard';

describe('UnauthGuard', () => {

    let guard: UnauthGuard;

    beforeEach(() => {
        guard = getService(UnauthGuard);
    });

    it('delegates to accessControlService', () => {
        const reply = mockInstance<boolean>('reply');
        when(getMock(AccessControlService).requestAccess('setup', 'the-url')).return(reply).once();
        guard.canActivate(mockInstance('state'), mockInstance(RouterStateSnapshot, {
            url: 'the-url'
        }));
        expect().nothing();
    });
});
