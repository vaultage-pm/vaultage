import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-password-list',
    templateUrl: 'password-list.component.html',
    styleUrls: [ 'password-list.component.scss' ]
})
export class PasswordListComponent {

    @Input()
    public items: IPasswordListEntry[] = [];

    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly clipboard: Clipboard,
        private readonly route: ActivatedRoute,
        private readonly router: Router) { }

    public onItemClick(itemId: string) {
        this.router.navigate(['view/', itemId], { relativeTo: this.route });
    }

    public usePassword(password: string) {
        this.clipboard.copy(password);
        this.snackBar.open('Password copied to clipboard!');
        history.back();
    }
}

export interface IPasswordListEntry {
    id: string;
    title: string;
    password: string;
    user: string;
    host: string;
}
