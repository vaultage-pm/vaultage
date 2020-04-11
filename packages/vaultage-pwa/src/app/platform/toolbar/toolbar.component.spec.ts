import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { getMock, getShallow } from 'ng-vacuum';
import { when } from 'omnimock';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { PlatformModule } from '../platform.module';
import { WINDOW } from '../providers';
import { IToolbarActionConfig, ToolbarComponent } from './toolbar.component';

describe('ToolbarComponent', () => {

    let page: Page;
    let bindings: {
        action?: IToolbarActionConfig
    };
    let action: IToolbarActionConfig;
    let fixture: ComponentFixture<ToolbarComponent>;

    beforeEach(async () => {
        action = {
            action: jasmine.createSpy(),
            icon: 'action-icon'
        };
        const rendering = await getShallow(ToolbarComponent, PlatformModule).render({
            bind: {
                title: 'Aloha',
                action: action
            }
        });
        bindings = rendering.bindings;
        fixture = rendering.fixture;
        page = new Page(rendering);
    });

    it('Displays the title', () => {
        expect(page.title).toEqual('Aloha');
    });

    it('shows no custom action by default', fakeAsync(() => {
        bindings.action = undefined;
        fixture.detectChanges();
        expect(page.hasCustomAction).toBe(false);
    }));

    it('shows a custom action', fakeAsync(() => {
        expect(page.hasCustomAction).toBe(true);
        expect(page.customAction.innerText).toBe('action-icon');
        page.customAction.click();
        flush();
        expect(action.action).toHaveBeenCalled();
    }));

    it('navigates back', () => {
        when(getMock(WINDOW).history.back()).return().once();
        page.backButton.click();
        expect().nothing();
    });
});

class Page {

    constructor(private readonly rendering: Rendering<ToolbarComponent, unknown>) { }

    public get title() {
        return (this.rendering.find('[test-id=toolbar-title]').nativeElement as HTMLElement).innerText;
    }

    public get customAction(): HTMLElement {
        return (this.rendering.find('[test-id=toolbar-custom-action]').nativeElement);
    }

    public get hasCustomAction() {
        return this.rendering.find('[test-id=toolbar-custom-action]').length > 0;
    }

    public get backButton(): HTMLElement {
        return this.rendering.find('[test-id=toolbar-back-button]').nativeElement;
    }
}
