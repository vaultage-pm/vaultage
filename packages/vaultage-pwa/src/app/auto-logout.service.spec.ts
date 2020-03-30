import { DOCUMENT } from '@angular/common';
import { anyFunction, anyString, reset, verify, when } from 'omnimock';

import { AuthService } from './auth.service';
import { AutoLogoutService } from './auto-logout.service';
import { createService, mockService, TestClass } from './test/angular-omnimock';


@TestClass()
export class AutoLogoutServiceTest {

    private readonly mockDocument = mockService(DOCUMENT, 'Document');
    private readonly mockAuthService = mockService(AuthService);
    private readonly service = createService(AutoLogoutService);

    private callback!: () => void;

    beforeEach() {
        when(this.mockDocument.addEventListener(anyString(), anyFunction())).call((evt, cb) => {
            expect(evt).toBe('visibilitychange');
            expect(typeof cb).toBe('function');
            this.callback = cb as () => void;
        }).once();
        this.service.init();
        verify(this.mockDocument);
        expect(this.callback).not.toBeUndefined();
    }

    public testLogsOutOnHidden() {
        when(this.mockDocument.hidden).useValue(true);
        when(this.mockAuthService.logOut()).return(undefined).once();
        this.callback();
    }

    public testIgnoresWhenNotHidden() {
        when(this.mockDocument.hidden).useValue(false);
        when(this.mockAuthService.logOut()).return(undefined).never();
        this.callback();
    }

    public testDoesntReSubscribe() {
        reset(this.mockDocument);
        this.service.init();
    }
}
