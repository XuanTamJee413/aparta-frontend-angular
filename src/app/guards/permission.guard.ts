import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function permissionGuard(requiredPermission: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated() && auth.hasPermission(requiredPermission)) {
      return true;
    }

    if (!auth.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    return router.parseUrl('/forbidden');
  };
}
