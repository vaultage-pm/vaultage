import { Inject } from '@angular/core';
import { WINDOW } from './providers';

export class ErrorHandlingService {

    constructor(@Inject(WINDOW) private readonly window: Window) { }

    public onError = (e: unknown) => {
        this.window.console.error(e);
    }
}
