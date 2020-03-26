import { Component } from '@angular/core';

@Component({
    selector: 'app-wallpaper',
    template: ``,
    styles: [`
        :host {
            /* The jpg background is 70% lighter than png but the gradient is not as smooth. */
            background-image: url('/assets/background.jpg');
            background-size: cover;
            height: 100vh;
            width: 100vw;
            position: absolute;
            overflow: hidden;
        }
    `]
})
export class WallpaperComponent {

}
