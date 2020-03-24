import { animate, group, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

import { LoginConfig, SetupService } from './setup.service';

type PageState = 'init' | 'login';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss'],
    animations: [
        trigger('loginTitle', [
            state('init', style({
                paddingTop: '25vh'
            })),
            state('login', style({
                paddingTop: '5vh',
                fontSize: '25px'
            })),
            transition('init => login', [
                animate('200ms')
            ]),
        ]),
        trigger('buttons', [
            transition('init => login', [
                style({ position: 'relative' }),
                query(':enter, :leave', [
                    style({
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%'
                    })
                ]),
                query(':enter', [
                    style({ top: '100%' })
                ]),
                group([
                    query(':leave', [
                        animate('300ms ease-out', style({
                            left: '-100%',
                        })),
                    ]),
                    query(':enter', [
                        animate('200ms ease-out', style({
                            top: 0
                        }))
                    ]),
                ]),
            ])
        ]),
        trigger('loginForm', [
            transition(':enter', [
                query('.reveal-field', [
                    style({ opacity: 0}),
                    stagger(50, [
                        animate('300ms ease-out')
                    ]),
                ]),
            ]),
        ]),
        trigger('basicFields', [
            transition('no => yes', [
                query('.basic-fields:enter', [
                    style({ height: 0, overflow: 'hidden'}),
                    animate('300ms ease-out'),
                ]),
            ]),
            transition('yes => no', [
                query('.basic-fields:leave', [
                    style({overflow: 'hidden'}),
                    animate('300ms ease-out', style({ height: 0})),
                ]),
            ]),
        ]),
    ]
})
export class LoginComponent {

    public pageState: PageState = 'init';

    public useBasic = false;

    constructor(private readonly setupService: SetupService) {}

    public activateLogin() {
        this.pageState = 'login';
    }

    public onLogin() {
        this.setupService.login({} as LoginConfig);
    }
}
