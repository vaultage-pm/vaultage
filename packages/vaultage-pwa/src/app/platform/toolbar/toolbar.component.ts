import { Component, Inject, Input } from '@angular/core';

import { WINDOW } from '../providers';

@Component({
    selector: 'app-toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: [ 'toolbar.component.scss']
})
export class ToolbarComponent {

    @Input()
    public title: string = '';

    @Input()
    public action?: IToolbarActionConfig;

    constructor(@Inject(WINDOW) private readonly window: Window) { }

    public onExit() {
        this.window.history.back();
    }
}

export interface IToolbarActionConfig {
    icon: string;
    action: () => void;
}
