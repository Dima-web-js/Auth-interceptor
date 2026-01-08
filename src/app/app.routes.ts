import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { ProfilePage } from './profile-page/profile-page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'profile',
    component: ProfilePage,
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
