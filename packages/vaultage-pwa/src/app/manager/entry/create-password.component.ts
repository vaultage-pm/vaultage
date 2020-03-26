import { Component } from '@angular/core';

@Component({
    selector: 'app-create-password',
    templateUrl: 'create-password.component.html',
    styleUrls: [ 'create-password.component.scss' ]
})
export class CreatePasswordComponent {

    onExit() {
        history.back();
    }
}
