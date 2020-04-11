import { flush } from '@angular/core/testing';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

export class BasePage<T> {
    constructor(public readonly rendering: Rendering<T, unknown>) { }

    detectChanges() {
        this.rendering.fixture.detectChanges();
        flush();
    }
}
