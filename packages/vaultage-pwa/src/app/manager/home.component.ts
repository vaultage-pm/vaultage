import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

    public readonly dummyItems: IPasswordListEntry[] = [
        {id: '1', title: 'Salt', user: 'salt', host: 'pepper' },
        {id: '2', title: 'Pepper', user: 'pepper', host: 'pepper.com' },
        {id: '3', title: 'Magenta', user: 'bloom', host: 'github.com' },
        {id: '4', title: 'Mars', user: 'moon', host: 'sun.space' },
        {id: '5', title: 'GitHub', user: 'hmil', host: 'github.com' },
        {id: '6', title: 'TP', user: 'toilet', host: 'paper' }
    ];

    private _searchValue: string = '';

    private _viewMode: HomeViewMode = 'initial';

    /**
     * Hacky way to implement stack navigation
     */
    private hasVisitedInitState = false;

    @ViewChild('search') searchElement?: ElementRef<HTMLInputElement>;

    constructor(private readonly route: ActivatedRoute, private readonly router: Router) { }

    public ngOnInit() {
        // This observable is automatically closed when the component is destroyed by the router
        this.route.paramMap.subscribe(params => {
            this._viewMode = params.get('mode') === 'search' ? 'search' : 'initial';
            if (this._viewMode === 'initial') {
                this.searchValue = '';
                this.searchElement?.nativeElement.blur();
            }
        });
        this.route.queryParamMap.subscribe(q => {
            this._searchValue = q.get('q') ?? '';
        });
    }

    public get listItems(): IPasswordListEntry[] {
        // TODO: Create a search service
        return this.dummyItems.filter(d => d.title.toLocaleLowerCase().indexOf(this.searchValue.toLocaleLowerCase()) >= 0);
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
        this.router.navigate(['/'], { replaceUrl: true });
    }

    public get searchValue(): string {
        return this._searchValue;
    }

    public set searchValue(v: string) {
        if (this.viewMode === 'search' && v !== this.searchValue) {
            this.router.navigate(['/home/search'], { replaceUrl: true, queryParams: { q: v } });
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
                    this.router.navigate(['/home/init'], { replaceUrl: true });
                }
            } else {
                this.hasVisitedInitState = true;
                this.router.navigate(['/home/search']);
            }
        }
    }
}

type HomeViewMode = 'initial' | 'search';
