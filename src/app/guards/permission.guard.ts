import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function permissionGuard(requiredPermission: string | string[]): CanActivateFn {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const has = Array.isArray(requiredPermission)
      ? requiredPermission.some(p => auth.hasPermission(p))
      : auth.hasPermission(requiredPermission);

    if (auth.isAuthenticated() && has) {
      return true;
    }

    if (!auth.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    return router.parseUrl('/forbidden');
  };
}
