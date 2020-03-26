import { Component } from '@angular/core';
import { BusyStateService } from './busy-state.service';

@Component({
    template: `
        <div class="overlay" *ngIf="isBusy">
            <mat-spinner></mat-spinner>
        </div>`,
    styles: [`
        .overlay {
            position: absolute;
            background-color: #00000044;
            width: 100vw;
            height: 100vh;
            top: 0;
            left: 0;
        }
        mat-spinner {
            margin: auto;
            margin-top: calc(50vh - 50px);
        }`],
    selector: 'app-busy-overlay'
})
export class BusyStateComponent {

    constructor(private readonly busyService: BusyStateService) {}

    public get isBusy() {
        return this.busyService.isBusy;
    }
}
