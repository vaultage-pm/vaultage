import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-manager',
    template: `<router-outlet></router-outlet>`,
    styles: [`
        :host {
            background-color: #0f384f;
            position: absolute;
            width: 100vw;
            height: 100vh;
        }`,
    ]
})
export class ManagerComponent {
}
