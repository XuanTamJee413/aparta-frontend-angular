import { CanActivateFn, CanMatchFn, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authCanActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Handle /login explicitly
  if (state.url.startsWith('/login')) {
    if (!auth.isAuthenticated()) return true;
    const home = auth.hasRole('admin') ? '/admin' : auth.hasRole('custom') ? '/manager/manage-resident' : auth.hasRole('staff') ? '/manager' : auth.hasRole('resident') ? '/home' : '/not-found';
    return router.parseUrl(home);
  }
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};

export const authCanMatch: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const url = '/' + segments.map(s => s.path).join('/');
  // Handle /login explicitly
  if (url.startsWith('/login')) {
    if (!auth.isAuthenticated()) return true;
    const home = auth.hasRole('admin') ? '/admin' : auth.hasRole('custom') ? '/manager/manage-resident' : auth.hasRole('staff') ? '/manager' : auth.hasRole('resident') ? '/home' : '/not-found';
    return router.parseUrl(home);
  }
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};


