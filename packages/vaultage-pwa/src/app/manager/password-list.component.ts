import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorHandlingService } from '../platform/error-handling.service';

@Component({
    selector: 'app-password-list',
    templateUrl: 'password-list.component.html',
    styleUrls: [ 'password-list.component.scss' ]
})
export class PasswordListComponent {

    @Input()
    public items: IPasswordListEntry[] = [];

    constructor(
        private readonly errorHandlingService: ErrorHandlingService,
        private readonly snackBar: MatSnackBar,
        private readonly clipboard: Clipboard,
        private readonly route: ActivatedRoute,
        private readonly router: Router) { }

    public onItemClick(itemId: string) {
        this.router.navigate(['view/', itemId], { relativeTo: this.route })
                .catch(err => {
                    this.snackBar.open('Failed to open item');
                    this.errorHandlingService.onError(err);
                });
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
