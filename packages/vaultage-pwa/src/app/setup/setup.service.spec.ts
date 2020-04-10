import { fakeAsync, flush } from '@angular/core/testing';
import { getMock, getService } from 'ng-vacuum';
import { anyString, anything, reset, when } from 'omnimock';

import { AuthService, LoginConfig } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';
import { SetupService } from './setup.service';

describe('SetupService', () => {

    let service: SetupService;

    beforeEach(() => {
        service = getService(SetupService);
    });

    it('doLogin runs the setup sequence', fakeAsync(() => {
        when(getMock(ErrorHandlingService).onError(anything())).return().never();

        const loginConfig: LoginConfig = {
            password: 'psswd',
            url: 'http:/7secret',
            username: 'john'
        };

        // Step 1: Initialize
        service.doLogin();
        expect(service.step).toBe('login');

        // Step 2: Notify credentials
        const busy = getMock(BusyStateService);
        when(busy.setBusy(true)).return().once();
        when(getMock(AuthService).testCredentials(loginConfig)).resolve().once();
        when(busy.setBusy(false)).return().once();
        service.notifyCredentials(loginConfig);
        flush();

        expect(service.step).toBe('set-pin');
        reset(busy);
        reset(getMock(AuthService));

        // Step 3: Notify pin
        when(busy.setBusy(true)).return().once();
        when(getMock(PinLockService).setSecret('1234', anyString())).call((_pin, data) => {
            expect(JSON.parse(data)).toEqual(loginConfig);
        }).once();
        when(busy.setBusy(false)).return().once();
        when(getMock(AuthService).logIn(loginConfig, '1234')).resolve().once();
        service.notifyPin('1234');
        flush();

    }));
});
