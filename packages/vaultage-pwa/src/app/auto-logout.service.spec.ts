import { DOCUMENT } from '@angular/common';
import { getMock, getService } from 'ng-vacuum';
import { anyFunction, anyString, Mock, reset, verify, when } from 'omnimock';

import { AuthService } from './auth.service';
import { AutoLogoutService } from './auto-logout.service';

describe('AutoLogoutService', () => {

    let mockDocument: Mock<Document>;
    let service: AutoLogoutService;

    let callback: () => void;

    beforeEach(() => {
        mockDocument = getMock(DOCUMENT);
        service = getService(AutoLogoutService);

        when(mockDocument.addEventListener(anyString(), anyFunction())).call((evt, cb) => {
            expect(evt).toBe('visibilitychange');
            expect(typeof cb).toBe('function');
            callback = cb as () => void;
        }).once();
        service.init();
        verify(mockDocument);
        expect(callback).not.toBeUndefined();
    });

    it('logs out on hidden', () => {
        const mockAuthService = getMock(AuthService);
        when(mockDocument.hidden).useValue(true);
        when(mockAuthService.logOut()).return(undefined).once();
        callback();
    });

    it('ignores when not hidden', () => {
        when(mockDocument.hidden).useValue(false);
        when(getMock(AuthService).logOut()).return(undefined).never();
        callback();
    });

    it('does not re-subscribe', () => {
        reset(mockDocument);
        service.init();
    });
});
