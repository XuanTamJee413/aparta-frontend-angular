import { CanMatchFn, CanActivateFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

type UserRole = 'admin' | 'staff' | 'resident';

export function roleCanMatch(expected: UserRole[] | UserRole): CanMatchFn {
  return (route: Route, segments: UrlSegment[]) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const roles = Array.isArray(expected) ? expected : [expected];
    if (auth.isAuthenticated() && auth.hasRole(roles)) {
      return true;
    }
    return router.parseUrl('/login');
  };
}

export function roleCanActivate(expected: UserRole[] | UserRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const roles = Array.isArray(expected) ? expected : [expected];
    if (auth.isAuthenticated() && auth.hasRole(roles)) {
      return true;
    }
    return router.parseUrl('/login');
  };
}


