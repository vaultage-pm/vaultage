import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordEntry, toVaultageEntry } from '../domain/PasswordEntry';
import { BusyStateService } from 'src/app/platform/busy-state.service';

@Component({
    selector: 'app-edit-password',
    templateUrl: 'edit-password.component.html',
    styleUrls: [ 'edit-password.component.scss' ]
})
export class EditPasswordComponent {

    private readonly entryId: string;

    public readonly entry: PasswordEntry;

    constructor(
            private readonly busy: BusyStateService,
            private readonly authService: AuthService,
            private readonly route: ActivatedRoute,
            private readonly router: Router) {
        this.entryId = route.snapshot.paramMap.get('id') ?? '';
        this.entry = authService.getVault().getEntry(this.entryId); // TODO: Is this supposed to throw when entry doesn't exist?
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
        vault.updateEntry(entry.id, toVaultageEntry(entry));
        await vault.save();
        this.onExit();
    }
}
