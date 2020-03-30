import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IVaultDBEntry } from 'vaultage-client';

import { AuthService } from '../../auth.service';
import { BusyStateService } from '../../platform/busy-state.service';
import { PasswordEntry, toVaultageEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-edit-password',
    templateUrl: 'edit-password.component.html',
    styleUrls: [ 'edit-password.component.scss' ]
})
export class EditPasswordComponent implements OnInit {

    public entry: PasswordEntry;

    constructor(
            private readonly busy: BusyStateService,
            private readonly authService: AuthService,
            private readonly snackBar: MatSnackBar,
            readonly route: ActivatedRoute) {
        this.entry = this.route.snapshot.data.entry;
    }

    public ngOnInit() {
        this.route.data.subscribe((data: { entry?: IVaultDBEntry }) => {
            if (data.entry == null) {
                throw new Error('Router did not provide mandatory "entry" parameter');
            }
            this.entry = data.entry;
        });
    }

    public onExit() {
        history.back();
    }

    public onSave(entry: PasswordEntry) {
        this.busy.setBusy(true);
        this.doSave(entry)
            .finally(() => this.busy.setBusy(false))
            .catch(e => this.snackBar.open(e.message, undefined, {
                panelClass: 'error'
            }));
    }

    private async doSave(entry: PasswordEntry) {
        const vault = this.authService.getVault();
        vault.updateEntry(entry.id, toVaultageEntry(entry));
        await vault.save();
        this.onExit();
    }
}
