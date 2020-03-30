import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { ErrorHandlingService } from '../platform/error-handling.service';
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
export class HomeComponent implements OnInit {

    private _searchValue: string = '';

    private _viewMode: HomeViewMode = 'initial';

    /**
     * Hacky way to implement stack navigation
     */
    private hasVisitedInitState = false;

    @ViewChild('search') searchElement?: ElementRef<HTMLInputElement>;

    constructor(
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly pinLockService: PinLockService,
            private readonly authService: AuthService,
            private readonly route: ActivatedRoute,
            private readonly router: Router) { }

    public ngOnInit() {
        // This observable is automatically closed when the component is destroyed by the router
        this.route.queryParamMap.subscribe(params => {
            this._searchValue = params.get('q') ?? '';
            this._viewMode = params.has('q') ? 'search' : 'initial';
            if (this._viewMode === 'initial') {
                this.searchElement?.nativeElement.blur();
            }
        });
    }

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
        return this._viewMode;
    }

    public doFocusIn() {
        this.setViewMode('search');
    }

    public clearInput() {
        this.searchValue = '';
        this.searchElement?.nativeElement.focus();
    }

    public exitSearchMode() {
        this.setViewMode('initial');
        this.searchValue = '';
    }

    public logOut() {
        this.pinLockService.reset();
        this.authService.logOut();
    }

    public get searchValue(): string {
        return this._searchValue;
    }

    public set searchValue(v: string) {
        if (this.viewMode === 'search' && v !== this.searchValue) {
            this.router.navigate(['/manager'], { replaceUrl: true, queryParams: { q: v } })
                    .catch(err => this.errorHandlingService.onError(err));
        }
    }

    private setViewMode(mode: HomeViewMode) {
        // Navigate such that the back button action makes sense
        if (mode !== this._viewMode) {
            this._viewMode = mode;
            if (mode === 'initial') {
                if (this.hasVisitedInitState) {
                    history.back();
                } else {
                    this.router.navigate(['/manager'], { replaceUrl: true })
                            .catch(err => this.errorHandlingService.onError(err));
                }
            } else {
                this.hasVisitedInitState = true;
                this.router.navigate(['/manager'], {queryParams: { q: this.searchValue }})
                        .catch(err => this.errorHandlingService.onError(err));
            }
        }
    }

    private getHost(url: string): string {
        const match = url.match(/^\s*(?:\w*:?\/?\/)?(\w+(?:\.\w+)*)/);
        if (match != null) {
            return match[1];
        }
        return url;
    }
}

type HomeViewMode = 'initial' | 'search';
