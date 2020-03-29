import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoLogoutService } from './auto-logout.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'vaultage-pwa';

    constructor(private readonly autoLogoutService: AutoLogoutService) { }

    public ngOnInit() {
        this.autoLogoutService.init();
    }
}
