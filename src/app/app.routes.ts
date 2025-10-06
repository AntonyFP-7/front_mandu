import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/routes/login.routes'),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/routes/dashboard.routes'),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
