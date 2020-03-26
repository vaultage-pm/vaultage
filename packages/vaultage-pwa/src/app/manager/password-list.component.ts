import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-password-list',
    templateUrl: 'password-list.component.html',
    styleUrls: [ 'password-list.component.scss' ]
})
export class PasswordListComponent {

    @Input()
    public items: IPasswordListEntry[] = [];

    constructor(private readonly router: Router) {}

    public onItemClick(itemId: string) {
        this.router.navigate(['/password/view/', itemId]);
    }
}


export interface IPasswordListEntry {
    id: string;
    title: string;
    user: string;
    host: string;
}
