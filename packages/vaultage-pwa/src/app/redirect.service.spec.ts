import { fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
import { anyString, anything, when } from 'omnimock';

import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { ErrorHandlingService } from './platform/error-handling.service';
import { RedirectService } from './redirect.service';

describe('RedirectService', () => {

    let service: RedirectService;

    beforeEach(() => {
        service = getService(RedirectService);
    });

    it('redirects to setup when not authenticated and no pin is set', () => {
        when(getMock(AuthService).isAuthenticated).useValue(false);
        when(getMock(PinLockService).hasSecret).useValue(false);
        when(getMock(Router).navigate([anyString()])).call(route => {
            expect(route).toEqual(['setup']);
            return Promise.resolve(true);
        });
        service.redirectToAuthZone('/next');
    });

    it('redirects to unlock when not authenticated but has pin', () => {
        when(getMock(AuthService).isAuthenticated).useValue(false);
        when(getMock(PinLockService).hasSecret).useValue(true);
        when(getMock(Router).navigate([anyString()], anything())).call((route, params) => {
            expect(route).toEqual(['unlock']);
            expect(params).toEqual({ queryParams: { next: '/next' }});
            return Promise.resolve(true);
        });
        service.redirectToAuthZone('/next');
    });

    it('redirects to manager when authenticated', () => {
        when(getMock(AuthService).isAuthenticated).useValue(true);
        when(getMock(PinLockService).hasSecret).useValue(true);
        when(getMock(Router).navigate([anyString()])).call(route => {
            expect(route).toEqual(['manager']);
            return Promise.resolve(true);
        });
        service.redirectToAuthZone('/next');
    });

    it('handles errors', fakeAsync(() => {
        when(getMock(AuthService).isAuthenticated).useValue(true);
        when(getMock(PinLockService).hasSecret).useValue(true);
        when(getMock(Router).navigate([anyString()])).reject('my error');
        when(getMock(ErrorHandlingService).onError(anything())).call(err => {
            expect(err).toEqual('my error');
        }).once();
        service.redirectToAuthZone('/next');
    }));
});
