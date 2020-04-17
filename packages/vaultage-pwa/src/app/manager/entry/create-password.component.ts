import { Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../auth.service';
import { BusyStateService } from '../../platform/busy-state.service';
import { WINDOW } from '../../platform/providers';
import { PasswordEntry, toVaultageEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-create-password',
    templateUrl: 'create-password.component.html',
    styleUrls: [ 'create-password.component.scss' ]
})
export class CreatePasswordComponent {

    constructor(
        @Inject(WINDOW) private readonly window: Window,
        private readonly snackBar: MatSnackBar,
        private readonly busy: BusyStateService,
        private readonly authService: AuthService) {
    }

    public onSave(entry: PasswordEntry) {
        this.busy.setBusy(true);
        this.doSave(entry)
                .finally(() => this.busy.setBusy(false))
                .catch(e => this.snackBar.open(e, undefined, {
                    panelClass: 'error'
                }));
    }

    private async doSave(entry: PasswordEntry) {
        const vault = this.authService.getVault();
        vault.addEntry(toVaultageEntry(entry));
        await vault.save();
        this.onExit();
    }

    private onExit() {
        this.window.history.back();
    }
}
