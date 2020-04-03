import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { anyArray, anything, mockInstance, when, reset, verify } from 'omnimock';
import { Subject } from 'rxjs';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { IVaultDBEntry, Vault } from 'vaultage-client';

import { AppModule } from '../app.module';
import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { getMock, renderComponent } from '../test/angular-omnimock';
import { HomeComponent } from './home.component';
import { PasswordListComponent } from './password-list.component';


// TODO: Move selectors into an object model

describe('HomeComponent', () => {

    let rendering: Rendering<HomeComponent, never>;
    let queryParamsMap: Subject<ParamMap>;

    async function sendQueryChangeEvent(query: string) {
        queryParamsMap.next(mockInstance<ParamMap>('ParamMap', {
            get(param) {
                expect(param).toBe('q');
                return query ?? '';
            },
            has(param) {
                expect(param).toBe('q');
                return !!query;
            }
        }));
        rendering.fixture.detectChanges();
        await rendering.fixture.whenStable();
    }

    function expectSearchMode(query: string) {
        const { find } = rendering;
        expect(find('[test-id="clear-search-action"]').length).toBe(1);
        expect((find('[test-id="search-input"]').nativeElement as HTMLInputElement).value).toBe(query);
    }

    function expectInitialMode() {
        const { find } = rendering;
        expect(find('[test-id="clear-search-action"]').length).toBe(0);
        expect((find('[test-id="search-input"]').nativeElement as HTMLInputElement).value).toBe('');
    }

    function fakeEntries(): IVaultDBEntry[] {
        return [
            mockInstance<IVaultDBEntry>('entry1', {
                url: 'http://url',
                id: '1',
                title: 'Yolo',
                login: 'swag',
                password: '5W4G'
            })
        ];
    }

    beforeEach(async () => {
        queryParamsMap = new Subject();
        when(getMock(ActivatedRoute).queryParamMap).useValue(queryParamsMap);
        when(getMock(AuthService).getVault()).return(mockInstance(Vault, {
            findEntries: fakeEntries
        }));

        rendering = await renderComponent(HomeComponent, AppModule);
    });

    it('responds to route changes', async () => {
        await sendQueryChangeEvent('some-query');
        expectSearchMode('some-query');
        await sendQueryChangeEvent('');
        expectInitialMode();
    });

    it('responds to focus (note: this test spec requires test browser to have focus)', async () => {
        const { find, fixture } = rendering;
        const router = getMock(Router);
        when(router.navigate(['/manager'], { queryParams: {q: ''} })).resolve(true).once();
        (find('[test-id="search-input"]').nativeElement as HTMLInputElement).focus();
        fixture.detectChanges();
        await fixture.whenStable();
        expectSearchMode('');
    });

    it('shows the list of results', async () => {
        await sendQueryChangeEvent('some-query');
        const { find } = rendering;
        expect((find('app-password-list').componentInstance as PasswordListComponent).items).toEqual([{
            host: 'url',
            id: '1',
            title: 'Yolo',
            user: 'swag',
            password: '5W4G'
        }]);
    });

    it('can log out', async () => {
        const { find } = rendering;
        when(getMock(PinLockService).reset()).return().once();
        when(getMock(AuthService).logOut()).return().once();
        (find('.simple-link').nativeElement as HTMLAnchorElement).click();

        expect().nothing();
    });

    it('clears and focuses input on click to cancel', async () => {
        const { find } = rendering;
        await sendQueryChangeEvent('some-query'); // First move to search mode
        expectSearchMode('some-query');

        when(getMock(Router).navigate(['/manager'], { replaceUrl: true, queryParams: {q: ''} })).resolve(true).once();
        const spy = spyOn((find('[test-id="search-input"]').nativeElement as HTMLInputElement), 'focus');

        (find('[test-id="clear-search-action"]').nativeElement as HTMLAnchorElement).click();

        expect(spy).toHaveBeenCalled();
    });
});
