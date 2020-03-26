import { Component, Input } from '@angular/core';

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

    public onExit() {
        history.back();
    }
}

export interface IToolbarActionConfig {
    icon: string;
    action: () => void;
}
