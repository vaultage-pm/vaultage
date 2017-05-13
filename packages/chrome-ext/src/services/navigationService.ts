import { VaultService } from './vaultService';

type Page = 'home' | 'site-form';

interface PageData {
    [key: string]: string;
}

export class NavigationService {

    private _page: Page = 'home';
    private _pageData: PageData | null = null;

    constructor(
            private vault: VaultService) {
    }

    private _navigate(page: Page, data: PageData | null): void {
        this._page = page;
        this._pageData = data;
    }

    public getCurrentPage(): string {
        if (!this.vault.getVault().isAuth()) {
            return 'login';
        } else {
            return this._page;
        }
    }

    public getPageData(): PageData {
        return JSON.parse(JSON.stringify(this._pageData));
    }

    public createSite(): void {
        this._navigate('site-form', null);
    }

    public editSite(id: string): void {
        this._navigate('site-form', { id });
    }

    public canGoBack(): boolean {
        return this._page != 'home' && this.vault.getVault().isAuth();
    }

    public goBack(): void {
        this._navigate('home', null);
    }

    public goHome(): void {
        this._navigate('home', null);
    }
}