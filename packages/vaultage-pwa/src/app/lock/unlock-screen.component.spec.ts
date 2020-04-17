import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { getMock, renderComponent } from 'ng-vacuum';
import { anything, when } from 'omnimock';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../app.module';
import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';
import { PinCodeComponent } from '../platform/pin-code/pin-code.component';
import { RedirectService } from '../redirect.service';
import { UnlockScreenComponent } from './unlock-screen.component';

describe('UnlockScreenComponent', () => {

    let page: Page;

    beforeEach(async () => {
        const rendering = await renderComponent(UnlockScreenComponent, AppModule);
        page = new Page(rendering);
    });

    it('alternative action is log out and redirect', () => {
        when(getMock(PinLockService).reset()).return().once();
        when(getMock(RedirectService).redirectToAuthZone('foo/bar')).return().once();
        when(getMock(ActivatedRoute).snapshot.url).useValue([new UrlSegment('foo', {}), new UrlSegment('bar', {})]).once();
        page.pinCode.altAction.next();
        expect().nothing();
    });

    it('logs in on submit', fakeAsync(() => {
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        when(getMock(PinLockService).getSecret('1234')).return('"secret"').once();
        when(getMock(ActivatedRoute).snapshot.queryParamMap.get('next')).return('next_url').once();
        when(getMock(AuthService).logIn('secret' as any, '1234', 'next_url')).resolve().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));

    it('logs in on submit (no next url)', fakeAsync(() => {
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        when(getMock(PinLockService).getSecret('1234')).return('"secret"').once();
        when(getMock(ActivatedRoute).snapshot.queryParamMap.get('next')).return(null).once();
        when(getMock(AuthService).logIn('secret' as any, '1234', undefined)).resolve().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));

    it('fails on invalid pin', fakeAsync(() => {
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        when(getMock(PinLockService).getSecret('1234')).return(undefined).once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        when(getMock(ErrorHandlingService).onError(anything())).call(err => {
            expect(err).toMatch(/Invalid pin/);
        }).once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));

    it('redirects when no pin set', fakeAsync(() => {
        when(getMock(ErrorHandlingService).onError(anything())).return().never(); // Expect no error
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(false).once();
        when(getMock(ActivatedRoute).snapshot.url).useValue([new UrlSegment('foo', {}), new UrlSegment('bar', {})]).once();
        when(getMock(RedirectService).redirectToAuthZone('foo/bar')).return().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));
});

class Page {
    constructor(private readonly rendering: Rendering<UnlockScreenComponent, never>) { }

    public get pinCode(): PinCodeComponent {
        return this.rendering.find('app-pin-code').componentInstance;
    }
}
