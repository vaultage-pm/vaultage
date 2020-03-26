import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IToolbarActionConfig } from 'src/app/platform/toolbar/toolbar.component';

@Component({
    selector: 'app-view-password',
    templateUrl: 'view-password.component.html',
    styleUrls: [ 'view-password.component.scss' ]
})
export class ViewPasswordComponent {

    public entry: IPasswordEntry = {
        id: '1',
        title: 'SomeEntry'
    };

    public toolbarAction: IToolbarActionConfig = {
        icon: 'edit',
        action: () => this.onEdit()
    };

    constructor(private readonly router: Router) {}

    onEdit() {
        this.router.navigate(['/password/edit', '1']);
    }

    onExit() {
        history.back();
    }
}

interface IPasswordEntry {
    title: string;
    id: string;
}
