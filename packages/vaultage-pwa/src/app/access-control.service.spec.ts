import { Mock, when } from 'omnimock';
import { AccessControlService } from './access-control.service';
import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { RedirectService } from './redirect.service';
import { getMock, getService } from './test/angular-omnimock';

describe('AccessControlService', () => {

    let service: AccessControlService;
    let authService: Mock<AuthService>;

    beforeEach(() => {
        authService = getMock(AuthService);
        service = getService(AccessControlService);
    });

    it('requestAccess returns true for manager zone when authenticated', () => {
        when(authService.isAuthenticated).useValue(true);
        expect(service.requestAccess('manager', '/current')).toBe(true);
    });

    it('requestAccess returns true for setup zone when not authenticated and no pin is saved', () => {
        const pinLockService = getMock(PinLockService);
        when(pinLockService.hasSecret).useValue(false);
        when(authService.isAuthenticated).useValue(false);
        expect(service.requestAccess('setup', '/current')).toBe(true);
    });

    it('requestAccess returns true for unlock-scrceen zone when not authenticated and pin is saved', () => {
        const pinLockService = getMock(PinLockService);
        when(pinLockService.hasSecret).useValue(true);
        when(authService.isAuthenticated).useValue(false);
        expect(service.requestAccess('unlock-screen', '/current')).toBe(true);
    });

    it('requestAccess redirects and returns false upon authentication error', () => {
        when(authService.isAuthenticated).useValue(false);
        when(getMock(RedirectService).redirectToAuthZone('/current')).return(undefined).once();
        expect(service.requestAccess('manager', '/current')).toBe(false);
    });
});
