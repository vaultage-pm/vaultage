import { fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { reset, when } from 'omnimock';
import { Subject } from 'rxjs';

import { ErrorHandlingService } from '../platform/error-handling.service';
import { WINDOW } from '../platform/providers';
import { getMock, getService } from '../test/angular-omnimock';
import { HomeNavigationService } from './home-navigation.service';

describe('HomeNavigationService', () => {

    let service: HomeNavigationService;

    let queryParamsMap: Subject<ParamMap>;

    let q: string | null;

    beforeEach(() => {
        q = null;
        queryParamsMap = new Subject();
        when(getMock(ActivatedRoute).snapshot.queryParamMap.get('q')).call(() => q);
        when(getMock(ActivatedRoute).snapshot.queryParamMap.has('q')).call(() => q != null);
        service = getService(HomeNavigationService);
    });

    it('responds to route changes', () => {
        q = 'some-query';
        expect(service.searchValue).toBe('some-query');
        expect(service.viewMode).toBe('search');
        q = null;
        expect(service.searchValue).toBe('');
        expect(service.viewMode).toBe('initial');
        q = '';
        expect(service.searchValue).toBe('');
        expect(service.viewMode).toBe('search');
    });

    it('does nothing when setting search value to the same value', async () => {
        q = 'the quick brown fox';
        service.searchValue = 'the quick brown fox';
        expect().nothing();
    });

    it('navigates when search value changes', () => {
        when(getMock(Router).navigate(['/manager'], { replaceUrl: true, queryParams: { q: 'the fox'}}))
            .resolve(true).once();
        service.searchValue = 'the fox';
        expect().nothing();
    });

    it('handles navigation error when search value changes', fakeAsync(() => {
        when(getMock(Router).navigate(['/manager'], { replaceUrl: true, queryParams: { q: 'the fox'}}))
            .reject('uh oh').once();
        when(getMock(ErrorHandlingService).onError('uh oh')).return().once();
        service.searchValue = 'the fox';
        expect().nothing();
    }));

    it('does nothing when setting view mode to the same value', () => {
        service.viewMode = 'initial';
        expect().nothing();
    });

    it('navigates to base url when setting initial mode from search mode', () => {
        q = 'some search';
        when(getMock(Router).navigate(['/manager'], { replaceUrl: true, queryParams: { q: undefined } }))
            .resolve(true).once();
        service.viewMode = 'initial';
        expect().nothing();
    });

    it('adds query param when going to search mode', () => {
        when(getMock(Router).navigate(['/manager'], { replaceUrl: false, queryParams: { q: '' } }))
            .resolve(true).once();
        service.viewMode = 'search';
        expect().nothing();
    });

    it('Uses history navigation when going back to initial after visiting search', () => {
        const router = getMock(Router);
        when(router.navigate(['/manager'], { replaceUrl: false, queryParams: { q: '' } }))
            .resolve(true).once();
        service.viewMode = 'search';

        q = '';
        reset(router);
        when(getMock(WINDOW).history.back()).return().once();
        service.viewMode = 'initial';
        expect().nothing();
    });
});
