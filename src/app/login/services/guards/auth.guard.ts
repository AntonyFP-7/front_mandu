import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';

export const privateGuard = (): CanActivateFn => {
  return () => {
    const authStateService = inject(AuthStateService);
    const router = inject(Router);
    const session = authStateService.getSession();
    if (!session) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const authStateService = inject(AuthStateService);
    const router = inject(Router);
    const session = authStateService.getSession();
    if (session) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  };
};

