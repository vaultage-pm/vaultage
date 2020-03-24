import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './setup/login.component';


const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    data: { animation: 'Home' }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
