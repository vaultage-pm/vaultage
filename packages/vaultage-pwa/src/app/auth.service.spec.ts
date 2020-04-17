import { Router } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
import { anyString, mockInstance, when } from 'omnimock';
import { Vault } from 'vaultage-client';

import { AuthService, LoginConfig } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { VAULTAGE } from './platform/providers';

describe('AuthService', () => {

    let service: AuthService;

    function fakeLoginConfig(): LoginConfig {
        return {
            username: 'John',
            password: 'Tr4v0lt4',
            url: 'http://pulp.fiction',
            basic: {
                username: 'Quentin',
                password: 'Tarantino'
            }
        };
    }

    let changeEvents: boolean[];

    beforeEach(() => {
        changeEvents = [];
        service = getService(AuthService);
        service.authStatusChange$.subscribe(change => changeEvents.push(change));
    });

    it('testCredentials logs in to test the credentials', async () => {
        const config = fakeLoginConfig();
        when(getMock(VAULTAGE).login('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}}))
                .resolve(mockInstance('vault'))
                .once();
        await service.testCredentials(config);
        expect().nothing();
    });

    it('getVault throws an error when not authenticated', () => {
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
    });

    it('starts out not authenticated', () => {
        expect(service.isAuthenticated).toBe(false);
    });

    it('authStatusChange$ emits a value immediately', () => {
        // authStatusChange$ emits as soon as we subscrcibe to it because it is based on a BehaviorSubject
        expect(changeEvents.length).toBe(1);
        expect(changeEvents[0]).toBe(false);
    });

    it('logIn logs in and redirects, logOut logs out', async () => {
        const config = fakeLoginConfig();
        const fakeVault = mockInstance<Vault>('vault');
        when(getMock(VAULTAGE).login('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}}))
            .resolve(fakeVault);
        when(getMock(PinLockService).setSecret('1234', anyString()))
            .call((pin, secret) => {
                expect(JSON.parse(secret)).toEqual(config);
            })
            .once();
        when(getMock(Router).navigateByUrl('/manager', { replaceUrl: true })).resolve(true).once();
        await service.logIn(config, '1234');

        expect(service.isAuthenticated).toBe(true);
        expect(service.getVault()).toBe(fakeVault);
        expect(changeEvents.length).toBe(2);
        expect(changeEvents[1]).toBe(true);

        service.logOut();

        expect(service.isAuthenticated).toBe(false);
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
        expect(changeEvents.length).toBe(3);
        expect(changeEvents[2]).toBe(false);
    });

    it('logIn redirects to next URL', async () => {
        const config = fakeLoginConfig();
        const fakeVault = mockInstance<Vault>('vault');
        when(getMock(VAULTAGE).login('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}}))
            .resolve(fakeVault);
        when(getMock(PinLockService).setSecret('1234', anyString())).return().once();
        when(getMock(Router).navigateByUrl(anyString(), { replaceUrl: true })).call(url => {
            expect(url).toBe('/next');
            return Promise.resolve(true);
        }).once();
        await service.logIn(config, '1234', '/next');
    });
});
