import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './manager/home.component';
import { CreatePasswordComponent } from './manager/entry/create-password.component';
import { EditPasswordComponent } from './manager/entry/edit-password.component';
import { ViewPasswordComponent } from './manager/entry/view-password.component';
import { SetupComponent } from './setup/setup.component';


const routes: Routes = [
    {
        path: '',
        component: SetupComponent
    },
    {
        path: 'home',
        redirectTo: 'home/init'
    },
    {
        path: 'home/:mode',
        component: HomeComponent
    },
    {
        path: 'password/create',
        component: CreatePasswordComponent
    },
    {
        path: 'password/view/:id',
        component: ViewPasswordComponent
    },
    {
        path: 'password/edit/:id',
        component: EditPasswordComponent
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
