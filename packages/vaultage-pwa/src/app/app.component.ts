import { Component, OnInit } from '@angular/core';
import { AutoLogoutService } from './auto-logout.service';
import { AutoRedirectService } from './auto-redirect.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'vaultage-pwa';

    constructor(
            private readonly autoLogoutService: AutoLogoutService,
            private readonly autoRedirectService: AutoRedirectService) { }

    public ngOnInit() {
        this.autoLogoutService.init();
        this.autoRedirectService.init();
    }
}
