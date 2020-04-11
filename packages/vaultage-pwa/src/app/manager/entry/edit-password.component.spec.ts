import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { createMock, getMock, renderComponent } from 'ng-vacuum';
import { anything, instance, matching, mock, mockInstance, objectEq, when } from 'omnimock';
import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { Vault } from 'vaultage-client';

import { AppModule } from '../../app.module';
import { AuthService } from '../../auth.service';
import { BusyStateService } from '../../platform/busy-state.service';
import { ErrorHandlingService } from '../../platform/error-handling.service';
import { WINDOW } from '../../platform/providers';
import { PasswordEntry } from '../domain/PasswordEntry';
import { PasswordFormComponent } from '../form/password-form.component';
import { EditPasswordComponent } from './edit-password.component';

describe('EditPasswordComponent', () => {

    let page: Page;
    let mockEntry: PasswordEntry;
    let routeDataSubject: Subject<{ entry?: PasswordEntry }>;
    let fixture: ComponentFixture<EditPasswordComponent>;

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

        const rendering = await renderComponent(EditPasswordComponent, AppModule);
        fixture = rendering.fixture;
        page = new Page(rendering);
    });

    it('let user update an entry', fakeAsync(() => {
        // Do not expect the snackbar to open
        when(getMock(MatSnackBar).open(anything())).return(mockInstance('snack')).never();

        const saveSubject = new Subject<void>();
        const fakeVault = mock(Vault);
        expect(page.form.entry).toEqual(mockEntry);

        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(AuthService).getVault()).return(instance(fakeVault)).once();
        when(fakeVault.updateEntry('1', objectEq({
            id: '1',
            login: 'John',
            password: '53cr3t',
            title: 'Foo',
            url: 'http://foo.bar'
        }))).return(mockInstance('result')).once();
        when(fakeVault.save()).return(saveSubject.pipe(first()).toPromise()).once();
        submitFakeForm();

        when(getMock(WINDOW).history.back()).return().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        saveSubject.next();
    }));

    it('shows errors in a snack', fakeAsync(() => {
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(AuthService).getVault()).throw(new Error('Not authenticated')).once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        when(getMock(MatSnackBar).open(matching(/Not authenticated/), undefined, { panelClass: 'error' }))
                .return(mockInstance('snack')).once();
        submitFakeForm();
        flush();
        expect().nothing();
    }));

    it('updates when the route parameter changes', fakeAsync(() => {
        mockEntry = {
            id: '3',
            login: 'Bruce',
            password: 'W1ll15',
            title: 'Batman',
            url: 'http://iambatm.an'
        };
        routeDataSubject.next({entry: { ...mockEntry} });
        fixture.detectChanges();
        expect(page.form.entry).toEqual(mockEntry);
    }));

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

    function submitFakeForm() {
            page.form.confirm.next({
            id: '1',
            login: 'John',
            password: '53cr3t',
            title: 'Foo',
            url: 'http://foo.bar'
        });
    }
});

class Page {

    constructor(private readonly rendering: Rendering<EditPasswordComponent, unknown>) { }

    get form() {
        return this.rendering.findComponent(PasswordFormComponent);
    }
}

