import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './auth.service';
import { UnlockScreenComponent } from './lock/unlock-screen.component';
import { CreatePasswordComponent } from './manager/entry/create-password.component';
import { EditPasswordComponent } from './manager/entry/edit-password.component';
import { ViewPasswordComponent } from './manager/entry/view-password.component';
import { PasswordFormComponent } from './manager/form/password-form.component';
import { HomeComponent } from './manager/home.component';
import { ManagerComponent } from './manager/manager.component';
import { PasswordListComponent } from './manager/password-list.component';
import { PlatformModule } from './platform/platform.module';
import { AuthGuard } from './routing/auth.guard';
import { LockScreenGuard } from './routing/lock-screen.guard';
import { UnauthGuard } from './routing/unauth.guard';
import { LoginComponent } from './setup/login.component';
import { PinSetupComponent } from './setup/pin-setup.component';
import { SetupComponent } from './setup/setup.component';
import { SetupService } from './setup/setup.service';

@NgModule({
    declarations: [
        AppComponent,
        CreatePasswordComponent,
        EditPasswordComponent,
        HomeComponent,
        LoginComponent,
        ManagerComponent,
        PasswordFormComponent,
        PasswordListComponent,
        PinSetupComponent,
        SetupComponent,
        UnlockScreenComponent,
        ViewPasswordComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatSnackBarModule,
        PlatformModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
    providers: [
        {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
        AuthGuard,
        AuthService,
        LockScreenGuard,
        SetupService,
        UnauthGuard
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
