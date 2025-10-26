import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authCanActivate: CanActivateFn = () => {
  // TEMPORARILY DISABLED - Allow all access without authentication
  return true;
  
  // const auth = inject(AuthService);
  // const router = inject(Router);
  // if (auth.isAuthenticated()) {
  //   return true;
  // }
  // return router.parseUrl('/login');
};

export const authCanMatch: CanMatchFn = () => {
  // TEMPORARILY DISABLED - Allow all access without authentication
  return true;
  
  // const auth = inject(AuthService);
  // const router = inject(Router);
  // if (auth.isAuthenticated()) {
  //   return true;
  // }
  // return router.parseUrl('/login');
};


