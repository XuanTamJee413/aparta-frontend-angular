import { CanMatchFn, CanActivateFn, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

type UserRole = 'admin' | 'staff' | 'resident' | 'custom';

export function roleCanMatch(expected: UserRole[] | UserRole): CanMatchFn {
  return (route: Route, segments: UrlSegment[]) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const roles = Array.isArray(expected) ? expected : [expected];
    if (auth.isAuthenticated() && auth.hasRole(roles)) {
      return true;
    }
    if (!auth.isAuthenticated()) {
      return router.parseUrl('/login');
    }
    const user = auth.user();
    const role = String(user?.role || '').trim().toLowerCase();
    const redirect = role === 'admin' ? '/admin' : role === 'custom' ? '/manager' : role === 'staff' ? '/manager' : '/home';
    return router.parseUrl(redirect);
  };
}

export function roleCanActivate(expected: UserRole[] | UserRole): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const roles = Array.isArray(expected) ? expected : [expected];

    if (!auth.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    const isAdmin = auth.hasRole('admin');
    const isResident = auth.hasRole('resident');
    const isStaff = auth.hasRole('staff');
    const isCustom = auth.hasRole('custom');

    // If role is missing/invalid after login
    if (!isAdmin && !isResident && !isStaff && !isCustom) {
      return router.parseUrl('/not-found');
    }

    if (auth.hasRole(roles)) {
      // Special handling for root path '/'
      if (state.url === '/') {
        if (isAdmin) return router.parseUrl('/admin');
        if (isStaff) return router.parseUrl('/manager');
        if (isResident) return router.parseUrl('/home');
        if (isCustom) return router.parseUrl('/manager');
      }
      return true;
    }

    // Authenticated but wrong role
    if (state.url === '/') {
      if (isAdmin) return router.parseUrl('/admin');
      if (isStaff) return router.parseUrl('/manager');
      if (isResident) return router.parseUrl('/home');
      if (isCustom) return router.parseUrl('/manager');
    }
    return router.parseUrl('/not-found');
  };
}


