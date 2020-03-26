import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BusyStateComponent } from './busy-state.component';
import { BusyStateService } from './busy-state.service';
import { ErrorHandlingService } from './error-handling.service';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WallpaperComponent } from './wallpaper.component';

@NgModule({
    declarations: [
        BusyStateComponent,
        ToolbarComponent,
        WallpaperComponent,
    ],
    imports: [
        CommonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
    ],
    exports: [
        BusyStateComponent,
        ToolbarComponent,
        WallpaperComponent,
    ],
    providers: [
        ErrorHandlingService,
        BusyStateService,
    ],
})
export class PlatformModule { }
