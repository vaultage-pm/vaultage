import { Component } from '@angular/core';

@Component({
    selector: 'app-edit-password',
    templateUrl: 'edit-password.component.html',
    styleUrls: [ 'edit-password.component.scss' ]
})
export class EditPasswordComponent {

    onExit() {
        history.back();
    }
}
