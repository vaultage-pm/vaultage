import { Component } from '@angular/core';

@Component({
    selector: 'app-password-form',
    templateUrl: 'password-form.component.html',
    styleUrls: [ 'password-form.component.scss' ]
})
export class PasswordFormComponent {

    onExit() {
        history.back();
    }
}
