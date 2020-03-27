import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PasswordEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-password-form',
    templateUrl: 'password-form.component.html',
    styleUrls: [ 'password-form.component.scss' ]
})
export class PasswordFormComponent {

    private id: string = '';

    public username: string = '';

    public password: string = '';

    public url: string = '';

    public title: string = '';

    public passwordInputType: PasswordInputType = 'password';

    @Output()
    public confirm = new EventEmitter<PasswordEntry>();

    @Input()
    public set entry(e: PasswordEntry) {
        this.id = e.id;
        this.username = e.login;
        this.password = e.password;
        this.url = e.url;
        this.title = e.title;
    }

    public onExit() {
        history.back();
    }

    public onSubmit() {
        this.confirm.emit({
            id: this.id,
            login: this.username,
            password: this.password,
            title: this.title,
            url: this.url
        });
    }

    public togglePasswordVisibility() {
        this.passwordInputType = this.passwordInputType === 'text' ? 'password' : 'text';
    }
}

type PasswordInputType = 'text' | 'password';
