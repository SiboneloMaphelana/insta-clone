import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  RouterLink,
  RouterModule,
  RouterOutlet,
  Routes,
} from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CreatePostComponent } from './create-post/create-post.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'create-post',
    component: CreatePostComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
