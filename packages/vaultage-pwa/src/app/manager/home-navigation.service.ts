import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { ErrorHandlingService } from '../platform/error-handling.service';
import { WINDOW } from '../platform/providers';

/**
 * The state of the home page is controlled by the URL parameters.
 * This class handles the mapping between URL parameter and view state.
 */
@Injectable()
export class HomeNavigationService {

    private hasVisitedInitState: boolean = false;

    constructor(
            @Inject(WINDOW) private readonly window: Window,
            private readonly router: Router,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly route: ActivatedRoute) {
    }

    public get viewMode() {
        return this.route.snapshot.queryParamMap.has('q') ? 'search' : 'initial';
    }

    public set viewMode(mode: HomeViewMode) {
        // Navigate in a way which makes sense of the back button
        if (mode !== this.viewMode) {
            if (mode === 'initial') {
                if (this.hasVisitedInitState) {
                    this.window.history.back();
                } else {
                    this.navigate({ replaceUrl: true });
                }
            } else {
                this.hasVisitedInitState = true;
                this.navigate({ replaceUrl: false, q: this.searchValue });
            }
        }
    }

    public get searchValue(): string {
        return this.route.snapshot.queryParamMap.get('q') ?? '';
    }

    public set searchValue(v: string) {
        if (v !== this.searchValue) {
            this.navigate({ replaceUrl: true, q: v });
        }
    }

    private navigate({replaceUrl, q}: { replaceUrl: boolean, q?: string }) {
        const extra: NavigationExtras = { replaceUrl, queryParams: { q } };
        this.router.navigate(['/manager'], extra)
                    .catch(err => this.errorHandlingService.onError(err));
    }
}

export type HomeViewMode = 'initial' | 'search';
