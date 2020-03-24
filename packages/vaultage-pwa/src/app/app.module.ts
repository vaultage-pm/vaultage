import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './manager/home.component';
import { PlatformModule } from './platform/platform.module';
import { LoginComponent } from './setup/login.component';
import { PinSetupComponent } from './setup/pin-setup.component';
import { SetupComponent } from './setup/setup.component';
import { SetupService } from './setup/setup.service';
import { PinCodeComponent } from './shared/pin-code.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        PinCodeComponent,
        PinSetupComponent,
        SetupComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        PlatformModule,
    ],
    providers: [
        SetupService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
