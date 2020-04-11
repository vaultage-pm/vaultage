import { fakeAsync, flush } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getMock, renderComponent } from 'ng-vacuum';
import { anything, instance, matching, mock, mockInstance, objectEq, when } from 'omnimock';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { Vault } from 'vaultage-client';

import { AppModule } from '../../app.module';
import { AuthService } from '../../auth.service';
import { BusyStateService } from '../../platform/busy-state.service';
import { WINDOW } from '../../platform/providers';
import { PasswordFormComponent } from '../form/password-form.component';
import { CreatePasswordComponent } from './create-password.component';

describe('CreatePasswordComponent', () => {

    let page: Page;

    beforeEach(async () => {
        const rendering = await renderComponent(CreatePasswordComponent, AppModule);
        page = new Page(rendering);
    });

    it('let user create an entry', fakeAsync(() => {
        // Do not expect the snackbar to open
        when(getMock(MatSnackBar).open(anything())).return(mockInstance('snack')).never();

        const saveSubject = new Subject<void>();
        const fakeVault = mock(Vault);
        expect(page.form.entry).toBeUndefined();
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(AuthService).getVault()).return(instance(fakeVault)).once();
        when(fakeVault.addEntry(objectEq({
            id: '',
            login: 'John',
            password: '53cr3t',
            title: 'Foo',
            url: 'http://foo.bar'
        }))).return('1').once();
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

    function submitFakeForm() {
            page.form.confirm.next({
            id: '',
            login: 'John',
            password: '53cr3t',
            title: 'Foo',
            url: 'http://foo.bar'
        });
    }
});

class Page {

    constructor(private readonly rendering: Rendering<CreatePasswordComponent, unknown>) { }

    get form() {
        return this.rendering.findComponent(PasswordFormComponent);
    }
}

