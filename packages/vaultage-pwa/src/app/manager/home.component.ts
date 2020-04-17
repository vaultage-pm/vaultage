import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { ErrorHandlingService } from '../platform/error-handling.service';
import { HomeNavigationService } from './home-navigation.service';
import { IPasswordListEntry } from './password-list.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss'],
    animations: [
        trigger('searchBar', [
            state('search', style({
                paddingTop: '0vh'
            })),
        ]),
        trigger('viewMode', [
            transition('initial => search', [
                group([
                    query('.main-search-container', animate('200ms ease-out', style({
                        paddingTop: '0'
                    }))),
                    // Disabled because buggy in firefox
                    // query(':leave', [animate('200ms ease-out', style({
                    //     opacity: 0,
                    //     padding: '0'
                    // }))]),
                    query(':enter', [
                        style({ top: '-100%' }),
                        animate('200ms ease-out')
                    ])
                ])
            ]),
            transition('search => initial', [
                group([
                    query('.main-search-container', [
                        style({ paddingTop: '0' }),
                        animate('200ms ease-out', style({
                            paddingTop: '25vh'
                        }))
                    ]),
                    query(':enter', [
                        style({ opacity: 0, padding: '0' }),
                        animate('200ms ease-out'),
                    ])
                ])
            ]),
        ]),
    ]
})
export class HomeComponent {

    @ViewChild('search') searchElement?: ElementRef<HTMLInputElement>;

    constructor(
            private readonly pinLockService: PinLockService,
            private readonly authService: AuthService,
            private readonly navigation: HomeNavigationService) { }

    // public ngOnInit() {
    //     this.navigation.activate();
    // }

    // public ngOnDestroy() {
    //     this.navigation.deactivate();
    // }

    public get listItems(): IPasswordListEntry[] {
        const vault = this.authService.getVault();
        return vault.findEntries(this.searchValue).map(e => ({
            host: this.getHost(e.url),
            id: e.id,
            title: e.title,
            user: e.login,
            password: e.password
        }));
    }

    public get viewMode() {
        return this.navigation.viewMode;
    }

    public get searchValue(): string {
        return this.navigation.searchValue;
    }

    public set searchValue(v: string) {
        this.navigation.searchValue = v;
    }

    public doFocusIn() {
        this.navigation.viewMode = 'search';
    }

    public clearInput() {
        this.searchValue = '';
        // tslint:disable-next-line: no-non-null-assertion
        this.searchElement!.nativeElement.focus();
    }

    public exitSearchMode() {
        this.navigation.viewMode = 'initial';
        this.searchValue = '';
    }

    public logOut() {
        this.pinLockService.reset();
        this.authService.logOut();
    }

    private getHost(url: string): string {
        const match = url.match(/^\s*(?:\w*:?\/?\/)?(\w+(?:\.\w+)*)/);
        if (match != null) {
            return match[1];
        }
        return url;
    }
}
