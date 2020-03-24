import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './manager/home.component';
import { SetupComponent } from './setup/setup.component';


const routes: Routes = [
    {
        path: '',
        component: SetupComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
