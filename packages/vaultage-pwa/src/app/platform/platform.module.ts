import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BusyStateComponent } from './busy-state.component';
import { BusyStateService } from './busy-state.service';
import { ErrorHandlingService } from './error-handling.service';
import { LocalStorageService } from './local-storage.service';
import { PinCodeComponent } from './pin-code/pin-code.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WallpaperComponent } from './wallpaper.component';

@NgModule({
    declarations: [
        BusyStateComponent,
        ToolbarComponent,
        WallpaperComponent,
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
        WallpaperComponent,
    ],
    providers: [
        BusyStateService,
        ErrorHandlingService,
        LocalStorageService,
    ],
})
export class PlatformModule { }
