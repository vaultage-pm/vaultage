import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { MatSpinner } from '@angular/material/progress-spinner';
import { getMock, renderComponent } from 'ng-vacuum';
import { when } from 'omnimock';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { BusyStateComponent } from './busy-state.component';
import { BusyStateService } from './busy-state.service';
import { PlatformModule } from './platform.module';

describe('BusyStateComponent', () => {

    let page: Page;
    let fixture: ComponentFixture<BusyStateComponent>;
    let isBusy: boolean;

    beforeEach(async () => {
        isBusy = false;
        when(getMock(BusyStateService).isBusy).useGetter(() => isBusy);
        const rendering = await renderComponent(BusyStateComponent, PlatformModule);
        fixture = rendering.fixture;
        page = new Page(rendering);
    });

    it('shows a spinner when busy', fakeAsync(() => {
        isBusy = true;
        fixture.detectChanges();
        flush();
        expect(page.spinner.length).toBe(1);
    }));

    it('hides the spinner when not busy', fakeAsync(() => {
        isBusy = false;
        fixture.detectChanges();
        flush();
        expect(page.spinner.length).toBe(0);
    }));
});

class Page {

    constructor(private readonly rendering: Rendering<BusyStateComponent, unknown>) {}

    get spinner() {
        return this.rendering.findComponent(MatSpinner);
    }
}
