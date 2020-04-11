import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, getMock, renderComponent } from 'ng-vacuum';
import { anyString, instance, matching, mockInstance, when } from 'omnimock';
import { Observable, Subject } from 'rxjs';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../../app.module';
import { ErrorHandlingService } from '../../platform/error-handling.service';
import { ToolbarComponent } from '../../platform/toolbar/toolbar.component';
import { PasswordEntry } from '../domain/PasswordEntry';
import { ViewPasswordComponent } from './view-password.component';

describe('ViewPasswordComponent', () => {

    let page: Page;
    let mockEntry: PasswordEntry;
    let routeDataSubject: Subject<{ entry?: PasswordEntry }>;
    let fixture: ComponentFixture<ViewPasswordComponent>;

    beforeEach(async () => {
        routeDataSubject = new Subject();
        mockEntry = {
            id: '1',
            login: 'Alan',
            password: '7ur1n6',
            title: 'Enigma',
            url: 'http://turingtest'
        };
        createMock(ActivatedRoute, {
            data: routeDataSubject
        });
        when(getMock(ActivatedRoute).snapshot.data.entry).return({...mockEntry}).once();

        const rendering = await renderComponent(ViewPasswordComponent, AppModule);
        fixture = rendering.fixture;
        page = new Page(rendering);
    });

    it('shows a password entry', () => {
        expect(page.username).toBe('Alan');
        expect(page.password).toBe('7ur1n6');
        expect(page.url).toBe('http://turingtest');
        expect(page.toolbar.title).toBe('Enigma');
    });

    it('updates when the route parameter changes', async () => {
        mockEntry = {
            id: '3',
            login: 'Bruce',
            password: 'W1ll15',
            title: 'Batman',
            url: 'http://iambatm.an'
        };
        routeDataSubject.next({entry: { ...mockEntry} });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(page.username).toBe('Bruce');
        expect(page.password).toBe('W1ll15');
        expect(page.url).toBe('http://iambatm.an');
        expect(page.toolbar.title).toBe('Batman');
    });

    it('resubscribes on parameter error', fakeAsync(() => {
        mockEntry = {
            id: '3',
            login: 'Bruce',
            password: 'W1ll15',
            title: 'Batman',
            url: 'http://iambatm.an'
        };
        when(getMock(ErrorHandlingService).onError(matching(/Router did not/))).return().once();

        // Override the activatedRoute mock so we can detect when the code re-subscribes
        let hasReSubscribed = false;
        when(getMock(ActivatedRoute).data).useValue(new Observable(() => {
            hasReSubscribed = true;
        })).once();
        routeDataSubject.next({ });
        flush();
        expect(hasReSubscribed).toBe(true);
    }));

    it('toolbar action goes to edit mode', () => {
        when(getMock(Router).navigate(['../../edit', '1'], { relativeTo: instance(getMock(ActivatedRoute)) })).resolve(true).once();
        page.toolbar.action?.action();
        expect().nothing();
    });

    it('catches navigation errors', fakeAsync(() => {
        when(getMock(Router).navigate(['../../edit', '1'], { relativeTo: instance(getMock(ActivatedRoute)) }))
                .reject(new Error('Not authenticated')).once();
        when(getMock(ErrorHandlingService).onError(matching(/Not authenticated/))).return().once();
        page.toolbar.action?.action();
        expect().nothing();
    }));

    it('copies password to clipboard on click', fakeAsync(() => {
        when(getMock(Clipboard).copy('7ur1n6')).return(true).once();
        when(getMock(MatSnackBar).open('Password copied to clipboard')).return(mockInstance('snack')).once();
        page.passwordWidget.click();
        expect().nothing();
    }));

    it('handles clipboard errors', fakeAsync(() => {
        when(getMock(Clipboard).copy(anyString())).return(false).once();
        when(getMock(ErrorHandlingService).onError(matching(/Failed to copy password/))).return(mockInstance('snack')).once();
        page.passwordWidget.click();
        expect().nothing();
    }));

    it('toggles password visibility', fakeAsync(() => {
        expect(page.passwordFieldType).toBe('password');
        page.togglePasswordButton.click();
        fixture.detectChanges();
        expect(page.passwordFieldType).toBe('text');
        page.togglePasswordButton.click();
        fixture.detectChanges();
        expect(page.passwordFieldType).toBe('password');
    }));
});

class Page {

    constructor(private readonly rendering: Rendering<ViewPasswordComponent, unknown>) { }

    get username(): string {
        return (this.rendering.find('[test-id=entry-username]').nativeElement as HTMLInputElement).value;
    }

    get password(): string {
        return (this.rendering.find('[test-id=entry-password]').nativeElement as HTMLInputElement).value;
    }

    get passwordFieldType() {
        return (this.rendering.find('[test-id=entry-password]').nativeElement as HTMLInputElement).getAttribute('ng-reflect-type');
    }

    get url(): string {
        return (this.rendering.find('[test-id=entry-url]').nativeElement as HTMLInputElement).value;
    }

    get toolbar() {
        return this.rendering.findComponent(ToolbarComponent);
    }

    get passwordWidget() {
        return this.rendering.find('[test-id=entry-password-widget]').nativeElement;
    }

    get togglePasswordButton() {
        return this.rendering.find('[test-id=entry-toggle-password]').nativeElement;
    }
}
