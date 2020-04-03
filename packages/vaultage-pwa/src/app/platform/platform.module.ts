import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import vaultage from 'vaultage-client';
import { BusyStateComponent } from './busy-state.component';
import { BusyStateService } from './busy-state.service';
import { ErrorHandlingService } from './error-handling.service';
import { PinCodeComponent } from './pin-code/pin-code.component';
import { LOCAL_STORAGE, VAULTAGE, WINDOW } from './providers';
import { ToolbarComponent } from './toolbar/toolbar.component';


@NgModule({
    declarations: [
        BusyStateComponent,
        ToolbarComponent,
        PinCodeComponent,
    ],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
    ],
    exports: [
        BusyStateComponent,
        PinCodeComponent,
        ToolbarComponent,
    ],
    providers: [
        BusyStateService,
        ErrorHandlingService,
        { provide: LOCAL_STORAGE, useValue: localStorage },
        { provide: VAULTAGE, useValue: vaultage },
        { provide: WINDOW, useValue: window },
    ],
})
export class PlatformModule { }
