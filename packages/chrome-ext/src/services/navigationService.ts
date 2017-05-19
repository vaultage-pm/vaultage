import { VaultService } from './vaultService';

export type Page = 'home' | 'site-form' | 'tfa-prompt';

interface PageData {
    [key: string]: string;
}

interface StackedPage {
    name: Page;
    data: PageData | null;
}

export class NavigationService {

    private _publicPages: Page[] = ['tfa-prompt'];
    private _page: Page = 'home';
    private _pageData: PageData | null = null;

    private _stack: StackedPage[] = [];

    constructor(
            private vaultService: VaultService) {
    }

    private _navigate(page: Page, data: PageData | null): void {
        this._stack.push({
            name: this._page,
            data: this._pageData
        });
        this._page = page;
        this._pageData = data;
    }
    
    private _clearStack(): void {
        this._stack.length = 0;
    }

    public getCurrentPage(): string {
        if (this._publicPages.indexOf(this._page) === -1 && !this.vaultService.getVault().isAuth()) {
            return 'login';
        } else {
            return this._page;
        }
    }

    public getPageData(): PageData {
        return JSON.parse(JSON.stringify(this._pageData));
    }

    public promptForTFA(): void {
        this._navigate('tfa-prompt', null);
    }

    public createSite(): void {
        this._navigate('site-form', null);
    }

    public editSite(id: string): void {
        this._navigate('site-form', { id });
    }

    public canGoBack(): boolean {
        return this._stack.length > 0;
    }

    public goBack(): void {
        if (this.canGoBack()) {
            let stacked = this._stack.splice(-1, 1)[0];
            this._page = stacked.name;
            this._pageData = stacked.data;
        }
    }

    public goHome(): void {
        this._navigate('home', null);
        this._clearStack();
    }
}