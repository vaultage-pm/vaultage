import { fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { anyString, Mock, when } from 'omnimock';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { AutoRedirectService } from './auto-redirect.service';
import { RedirectService } from './redirect.service';
import { getMock, getService } from 'ng-vacuum';

describe('AutoRedirectService', () => {

    let service: AutoRedirectService;
    let authService: Mock<AuthService>;
    let statusChange$: Subject<boolean>;

    beforeEach(() => {
        authService = getMock(AuthService);
        statusChange$ = new Subject<boolean>();
        when(authService.authStatusChange$).useValue(statusChange$);
        service = getService(AutoRedirectService);
        service.init();
    });

    // fakeAsync makes sure all rxjs tasks are flushed before the end of the test in case any processing gets defered.
    it('does nothing when status changes to authenticated', fakeAsync(() => {
        statusChange$.next(true);
        expect().nothing();
    }));

    it('redirect when status changes to unauthenticated', fakeAsync(() => {
        when(getMock(Router).routerState.snapshot.url).useValue('mock-url');
        when(getMock(RedirectService).redirectToAuthZone(anyString())).call(str => {
            expect(str).toBe('mock-url');
            return Promise.resolve(true);
        }).once();
        statusChange$.next(false);
    }));
});
