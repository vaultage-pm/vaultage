import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPasswordListEntry } from './password-list.component';
import { AuthService } from '../auth.service';

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
                    query(':leave', animate('200ms ease-out', style({
                        opacity: 0,
                        padding: '0'
                    }))),
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

    public items: IPasswordListEntry[] = [];

    private _searchValue: string = '';

    private _viewMode: HomeViewMode = 'initial';

    /**
     * Hacky way to implement stack navigation
     */
    private hasVisitedInitState = false;

    @ViewChild('search') searchElement?: ElementRef<HTMLInputElement>;

    constructor(
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

        this.initListItems();
    }

    public get listItems(): IPasswordListEntry[] {
        // TODO: Create a search service
        return this.items.filter(d => d.title.toLocaleLowerCase().indexOf(this.searchValue.toLocaleLowerCase()) >= 0);
    }

    public get viewMode() {
        return this._viewMode;
    }

    public doFocusIn() {
        this.setViewMode('search');
    }

    public doFocusOut() {
        // if (this.searchValue.trim().length === 0) {
        //     this.setViewMode('initial');
        // }
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
        this.authService.logOut();
    }

    public lock() {
        this.authService.lock();
    }

    public get searchValue(): string {
        return this._searchValue;
    }

    public set searchValue(v: string) {
        if (this.viewMode === 'search' && v !== this.searchValue) {
            this.router.navigate(['/manager'], { replaceUrl: true, queryParams: { q: v } });
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
                    this.router.navigate(['/manager'], { replaceUrl: true });
                }
            } else {
                this.hasVisitedInitState = true;
                this.router.navigate(['/manager'], {queryParams: { q: this.searchValue }});
            }
        }
    }

    private initListItems() {
        const vault = this.authService.getVault();
        this.items = vault.getAllEntries().map(e => ({
            host: this.getHost(e.url),
            id: e.id,
            title: e.title,
            user: e.login,
            password: e.password
        }));
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
