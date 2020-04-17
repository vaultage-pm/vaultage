import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { getMock, renderComponent } from 'ng-vacuum';
import { when } from 'omnimock';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../app.module';
import { PinCodeComponent } from '../platform/pin-code/pin-code.component';
import { PinSetupComponent } from './pin-setup.component';
import { SetupService } from './setup.service';

describe('PinSetupComponent', () => {
    let page: Page;
    let fixture: ComponentFixture<PinSetupComponent>;

    beforeEach(async () => {
        const rendering = await renderComponent(PinSetupComponent, AppModule);
        fixture = rendering.fixture;
        page = new Page(rendering);
    });

    it('lets user set a new pin', fakeAsync(() => {
        expect(page.pinCode.title).toBe('Choose a new pin');
        page.pinCode.confirm.next('1337');
        page.detectChanges();
        when(getMock(SetupService).notifyPin('1337')).return().once();
        expect(page.pinCode.title).toBe('Confirm new pin');
        page.pinCode.confirm.next('1337');
    }));

    it('restarts when pins dont match', fakeAsync(() => {
        expect(page.pinCode.errorMessage).toBeFalsy();
        expect(page.pinCode.title).toBe('Choose a new pin');
        page.pinCode.confirm.next('1337');
        page.detectChanges();
        expect(page.pinCode.title).toBe('Confirm new pin');
        page.pinCode.confirm.next('3113');
        page.detectChanges();
        expect(page.pinCode.title).toBe('Choose a new pin');
        expect(page.pinCode.errorMessage).not.toBeFalsy();
    }));
});

class Page {

    constructor(private readonly rendering: Rendering<PinSetupComponent, unknown>) { }

    get pinCode() {
        return this.rendering.findComponent(PinCodeComponent);
    }

    detectChanges() {
        this.rendering.fixture.detectChanges();
        flush();
    }
}
