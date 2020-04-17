import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { getShallow } from 'ng-vacuum';
import { first } from 'rxjs/operators';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { PlatformModule } from '../platform.module';
import { PinCodeComponent } from './pin-code.component';

describe('PinCodeComponent', () => {

    let page: Page;
    let fixture: ComponentFixture<PinCodeComponent>;
    let confirmation: Promise<string>;
    let altAction: Promise<void>;
    let bindings: {
        altActionName?: string;
    };

    beforeEach(async () => {
        const renderer = await getShallow(PinCodeComponent, PlatformModule).render({
            bind: {
                altActionName: 'test'
            }
        });
        bindings = renderer.bindings;
        fixture = renderer.fixture;
        confirmation = renderer.outputs.confirm.pipe(first()).toPromise();
        altAction = renderer.outputs.altAction.pipe(first()).toPromise();
        page = new Page(renderer);
    });

    it('can type a combination', fakeAsync(async () => {
        expect(page.acceptButtonDisabled).toBe(true);

        clickAndWait(page.getKeyNum(1));
        expect(page.digitsOnScreen).toBe('1');
        expect(page.acceptButtonDisabled).toBe(true);

        clickAndWait(page.getKeyNum(2));
        expect(page.digitsOnScreen).toBe('•2');
        expect(page.acceptButtonDisabled).toBe(true);

        clickAndWait(page.getKeyNum(3));
        expect(page.digitsOnScreen).toBe('••3');
        expect(page.acceptButtonDisabled).toBe(true);

        clickAndWait(page.backspaceButton);
        expect(page.digitsOnScreen).toBe('••');
        expect(page.acceptButtonDisabled).toBe(true);

        clickAndWait(page.getKeyNum(4));
        expect(page.digitsOnScreen).toBe('••4');
        expect(page.acceptButtonDisabled).toBe(true);

        clickAndWait(page.getKeyNum(5));
        expect(page.digitsOnScreen).toBe('•••5');
        expect(page.acceptButtonDisabled).toBe(false);

        clickAndWait(page.getKeyNum(6));
        expect(page.digitsOnScreen).toBe('••••6');
        expect(page.acceptButtonDisabled).toBe(false);

        page.acceptButton.click();
        flush();
        expect(await confirmation).toBe('12456');
    }));

    it('shows an alternative action when needed', async () => {
        bindings.altActionName = undefined;
        fixture.detectChanges();
        expect(page.isAlternativeActionShown).toBe(false);
        bindings.altActionName = 'test';
        fixture.detectChanges();
        expect(page.isAlternativeActionShown).toBe(true);

        page.alternativeAction.click();
        expect(await altAction).toBeUndefined();
    });

    function clickAndWait(btn: HTMLElement) {
        btn.click();
        fixture.detectChanges();
        flush();
    }
});

class Page {

    constructor(private readonly renderer: Rendering<PinCodeComponent, any>) { }

    public getKeyNum(num: number): HTMLButtonElement {
        return this.renderer.find(`[test-id=keypad-${num}`).nativeElement;
    }

    public get acceptButton(): HTMLButtonElement {
        return this.renderer.find('[test-id=keypad-accept]').nativeElement;
    }

    public get acceptButtonDisabled() {
        return this.renderer.find('[test-id=keypad-accept]').attributes['ng-reflect-disabled'] === 'true';
    }

    public get backspaceButton(): HTMLButtonElement {
        return this.renderer.find('[test-id=keypad-backspace]').nativeElement;
    }

    public get digitsOnScreen() {
        return this.renderer.find('[test-id=keypad-screen]').nativeElement.innerText.replace(/\s/g, '');
    }

    public get isAlternativeActionShown() {
        return this.renderer.find('[test-id=keypad-alt]').length > 0;
    }

    public get alternativeAction(): HTMLElement {
        return this.renderer.find('[test-id=keypad-alt]').nativeElement;
    }
}
