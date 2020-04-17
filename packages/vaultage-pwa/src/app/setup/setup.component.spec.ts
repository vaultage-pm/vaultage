import { fakeAsync } from '@angular/core/testing';
import { getMock, renderComponent } from 'ng-vacuum';
import { when } from 'omnimock';

import { AppModule } from '../app.module';
import { BasePage } from '../test/base-page';
import { LoginComponent } from './login.component';
import { PinSetupComponent } from './pin-setup.component';
import { SetupComponent } from './setup.component';
import { SetupService, SetupStep } from './setup.service';

describe('SetupComponent', () => {

    let page: Page;
    let step: SetupStep;

    beforeEach(async () => {
        // Expect initialization of login service in onInit
        when(getMock(SetupService).doLogin()).return().once();
        when(getMock(SetupService).step).useGetter(() => step);
        step = 'login';
        page = new Page(await renderComponent(SetupComponent, AppModule));
    });

    it('shows the login page on login step', fakeAsync(() => {
        expect(page.isLoginShown).toBe(true);
        expect(page.isPinSetupShown).toBe(false);
        step = 'set-pin';
        page.detectChanges();
        expect(page.isLoginShown).toBe(false);
        expect(page.isPinSetupShown).toBe(true);
    }));
});

class Page extends BasePage<SetupComponent> {

    get isLoginShown() {
        return this.rendering.findComponent(LoginComponent).length > 0;
    }

    get isPinSetupShown() {
        return this.rendering.findComponent(PinSetupComponent).length > 0;
    }
}
