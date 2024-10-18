import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'cosasFeas',
    loadComponent: () => import('./pages/cosas-feas/cosas-feas.page').then( m => m.CosasFeasPage)
  },
  {
    path: 'cosasLindas',
    loadComponent: () => import('./pages/cosas-lindas/cosas-lindas.page').then( m => m.CosasLindasPage)
  },
];
