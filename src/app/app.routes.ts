import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './login/services/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [publicGuard()],
    loadChildren: () => import('./login/routes/login.routes'),
  },
  {
    path: 'dashboard',
    canActivate: [privateGuard()],
    loadChildren: () => import('./dashboard/routes/dashboard.routes'),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
