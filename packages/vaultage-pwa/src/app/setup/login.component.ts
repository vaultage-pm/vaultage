import { animate, group, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { LoginConfig } from '../auth.service';
import { LOCAL_STORAGE } from '../platform/providers';
import { SetupService } from './setup.service';

export type PageState = 'init' | 'login';

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
export class LoginComponent implements OnInit {

    public pageState: PageState = 'init';

    public username: string = '';
    public password: string = '';
    public url: string = '';
    public useBasic: boolean = false;
    public basicUsername: string = '';
    public basicPassword: string = '';

    public hostLocked: boolean = false;
    public basicLocked: boolean = false;

    constructor(
        @Inject(LOCAL_STORAGE) private readonly ls: Storage,
        private readonly setupService: SetupService) {}

    private configureSelfContained() {
        if((window as any).__self_contained || this.ls.getItem('self_contained') == 'true') {
            this.hostLocked = true;
            this.url = document.location.origin + '/';
            this.ls.setItem('self_contained', 'true');
        }
        if((window as any).__use_basic || this.ls.getItem('use_basic') == 'true') {
            this.basicLocked = true;
            this.useBasic = true;
            this.ls.setItem('use_basic', 'true');
        }
    }

    public ngOnInit() {
        this.configureSelfContained();
        const item = this.ls.getItem('creds');
        if (item != null) {
            // TODO: sanitize input
            const parsed = JSON.parse(item);
            this.url = parsed.url;
            this.username = parsed.username;
        }
    }

    public activateLogin() {
        this.pageState = 'login';
    }

    public onLogin() {
        const creds = this.makeLoginConfig();
        this.ls.setItem('creds', JSON.stringify({ url: this.url, username: this.username }));
        this.setupService.notifyCredentials(creds);
    }

    private makeLoginConfig(): LoginConfig {
        return {
            username: this.username,
            password: this.password,
            url: this.url,
            basic: this.useBasic === false ? undefined : {
                username: this.basicUsername,
                password: this.basicPassword
            }
        };
    }
}
