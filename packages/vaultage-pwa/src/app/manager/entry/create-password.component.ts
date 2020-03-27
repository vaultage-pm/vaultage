import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import { BusyStateService } from '../../platform/busy-state.service';
import { PasswordEntry, toVaultageEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-create-password',
    templateUrl: 'create-password.component.html',
    styleUrls: [ 'create-password.component.scss' ]
})
export class CreatePasswordComponent {

    constructor(
        private readonly busy: BusyStateService,
        private readonly authService: AuthService,
        private readonly route: ActivatedRoute,
        private readonly router: Router) {
    }

    public onExit() {
        history.back();
    }

    public onSave(entry: PasswordEntry) {
        this.busy.setBusy(true);
        this.doSave(entry).finally(() => this.busy.setBusy(false));
    }

    private async doSave(entry: PasswordEntry) {
        const vault = this.authService.getVault();
        vault.addEntry(toVaultageEntry(entry));
        await vault.save();
        this.onExit();
    }
}
