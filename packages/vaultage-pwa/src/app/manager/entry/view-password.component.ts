import { Clipboard } from '@angular/cdk/clipboard';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { IToolbarActionConfig } from 'src/app/platform/toolbar/toolbar.component';

import { PasswordEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-view-password',
    templateUrl: 'view-password.component.html',
    styleUrls: [ 'view-password.component.scss' ]
})
export class ViewPasswordComponent {

    public entry: PasswordEntry;

    private passwordVisible = false;

    public toolbarAction: IToolbarActionConfig = {
        icon: 'edit',
        action: () => this.onEdit()
    };

    private readonly entryId: string;

    constructor(
            readonly authService: AuthService,
            private readonly clipboard: Clipboard,
            private readonly route: ActivatedRoute,
            private readonly router: Router) {
        this.entryId = route.snapshot.paramMap.get('id') ?? '';
        this.entry = authService.getVault().getEntry(this.entryId); // TODO: Is this supposed to throw when entry doesn't exist?
    }

    public get printablePassword() {
        return this.passwordVisible ? this.entry.password : '••••••••';
    }

    public onEdit() {
        this.router.navigate(['../../edit', this.entryId], { relativeTo: this.route });
    }

    public onExit() {
        history.back();
    }

    public togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    public copyToClipboard() {
        this.clipboard.copy(this.entry.password);
    }
}


