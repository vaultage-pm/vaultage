import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BusyStateComponent } from './busy-state.component';
import { BusyStateService } from './busy-state.service';
import { ErrorHandlingService } from './error-handling.service';

@NgModule({
    declarations: [
        BusyStateComponent,
    ],
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
    ],
    exports: [
        BusyStateComponent
    ],
    providers: [
        ErrorHandlingService,
        BusyStateService,
    ],
})
export class PlatformModule { }
