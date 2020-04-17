import { fakeAsync } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { getMock, getShallow } from 'ng-vacuum';
import { anyString, when } from 'omnimock';

import { AppModule } from '../app.module';
import { LOCAL_STORAGE } from '../platform/providers';
import { BasePage } from '../test/base-page';
import { typeValue } from '../test/test-utils';
import { LoginComponent } from './login.component';
import { SetupService } from './setup.service';


describe('LoginComponent', () => {

    it('loads stored credentials', fakeAsync(async () => {

        const fakeStoredCreds = {
            url: 'http://foo.com',
            username: 'John Cena'
        };

        const page = await createPage(fakeStoredCreds);
        page.startButton.click();
        page.detectChanges();
        expect(page.usernameInput.value).toBe('John Cena');
        expect(page.hostInput.value).toBe('http://foo.com');
    }));

    it('lets a user input fresh credentials', fakeAsync(async () => {
        const page = await createPage();
        page.startButton.click();
        page.detectChanges();
        typeValue(page.usernameInput, 'Bruce');
        typeValue(page.passwordInput, 'Willis');
        typeValue(page.hostInput, 'http://diehardfan');

        page.toggleBasic();
        page.detectChanges();
        typeValue(page.basicUsernameInput, 'foo');
        typeValue(page.basicPasswordInput, 'bar');

        // TODO: Would be nice to have an omnimock matcher for json
        when(getMock(LOCAL_STORAGE).setItem('creds', anyString())).call((_id, value) => {
            expect(JSON.parse(value)).toEqual({
                url: 'http://diehardfan',
                username: 'Bruce'
            });
        }).once();
        when(getMock(SetupService).notifyCredentials({
            username: 'Bruce',
            password: 'Willis',
            url: 'http://diehardfan',
            basic: {
                username: 'foo',
                password: 'bar'
            }
        })).return().once();
        page.loginButton.click();
    }));

    it('lets a user input fresh credentials without basic', fakeAsync(async () => {
        const page = await createPage();
        page.startButton.click();
        page.detectChanges();
        typeValue(page.usernameInput, 'Bruce');
        typeValue(page.passwordInput, 'Willis');
        typeValue(page.hostInput, 'http://diehardfan');

        // TODO: Would be nice to have an omnimock matcher for json
        when(getMock(LOCAL_STORAGE).setItem('creds', anyString())).call((_id, value) => {
            expect(JSON.parse(value)).toEqual({
                url: 'http://diehardfan',
                username: 'Bruce'
            });
        }).once();
        when(getMock(SetupService).notifyCredentials({
            username: 'Bruce',
            password: 'Willis',
            url: 'http://diehardfan',
            basic: undefined
        })).return().once();
        page.loginButton.click();
    }));
});

async function createPage(storage?: any) {
    when(getMock(LOCAL_STORAGE).getItem('creds')).return(JSON.stringify(storage)).once();
    return new Page(await getShallow(LoginComponent, AppModule)
            .dontMock(FormsModule)
            .render());
}

class Page extends BasePage<LoginComponent> {

    get loginButton(): HTMLElement {
        return this.rendering.find('[test-id=login-login-button]').nativeElement;
    }

    get startButton(): HTMLElement {
        return this.rendering.find('[test-id=login-start-button]').nativeElement;
    }

    toggleBasic() {
        const directive = this.rendering.findDirective(NgModel, { query: '[test-id=login-basic-toggle]' });
        return directive.update.next(!directive.value);
    }

    get usernameInput(): HTMLInputElement {
        return this.rendering.find('[test-id=login-username]').nativeElement;
    }

    get passwordInput(): HTMLInputElement {
        return this.rendering.find('[test-id=login-password]').nativeElement;
    }

    get basicUsernameInput(): HTMLInputElement {
        return this.rendering.find('[test-id=login-basic-username]').nativeElement;
    }

    get basicPasswordInput(): HTMLInputElement {
        return this.rendering.find('[test-id=login-basic-password]').nativeElement;
    }

    get hostInput(): HTMLInputElement {
        return this.rendering.find('[test-id=login-host]').nativeElement;
    }
}
