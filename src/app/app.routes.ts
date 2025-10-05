import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/routes/login.routes'),
  },
  {
    path: '',
    loadChildren: () => import('./dashboard/routes/dashboard.routes'),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
