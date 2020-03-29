import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnlockScreenComponent } from './lock/unlock-screen.component';
import { CreatePasswordComponent } from './manager/entry/create-password.component';
import { EditPasswordComponent } from './manager/entry/edit-password.component';
import { VaultEntryResolver } from './manager/entry/vault-entry-resolver.service';
import { ViewPasswordComponent } from './manager/entry/view-password.component';
import { HomeComponent } from './manager/home.component';
import { ManagerComponent } from './manager/manager.component';
import { AuthGuard } from './routing/auth.guard';
import { LockScreenGuard } from './routing/lock-screen.guard';
import { UnauthGuard } from './routing/unauth.guard';
import { SetupComponent } from './setup/setup.component';


const routes: Routes = [
{
    path: '',
    pathMatch: 'full',
    redirectTo: 'manager'
}, {
    path: 'setup',
    component: SetupComponent,
    canActivate: [UnauthGuard]
}, {
    path: 'unlock',
    component: UnlockScreenComponent,
    canActivate: [LockScreenGuard]
}, {
    path: 'manager',
    canActivate: [AuthGuard],
    component: ManagerComponent,
    children: [{
        path: '',
        component: HomeComponent
    }, {
        path: 'create',
        component: CreatePasswordComponent
    }, {
        path: 'view/:id',
        component: ViewPasswordComponent,
        resolve: {
            entry: VaultEntryResolver
        }
    }, {
        path: 'edit/:id',
        component: EditPasswordComponent,
        resolve: {
            entry: VaultEntryResolver
        }
    }]
}];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
