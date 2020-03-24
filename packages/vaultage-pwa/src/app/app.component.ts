import { Component } from '@angular/core';
import { trigger, transition, style, query, animateChild, group, animate } from '@angular/animations';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('routeAnimations', [
            transition('Home => Login', [
                style({ position: 'relative' }),
                query(':enter, :leave', [
                    style({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    })
                ]),
                query(':enter', [
                    style({ left: '100%'})
                ]),
                query(':leave', animateChild()),
                group([
                    query(':leave', [
                        animate('300ms ease-out', style({ left: '-100%'}))
                    ]),
                    query(':enter', [
                        animate('300ms ease-out', style({ left: '0%'}))
                    ])
                ]),
                query(':enter', animateChild()),
            ])
        ])
    ]
})
export class AppComponent {
    title = 'vaultage-pwa';

    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }
}
