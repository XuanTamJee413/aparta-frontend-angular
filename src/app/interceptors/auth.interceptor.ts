import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TEMPORARILY DISABLED - Don't send Bearer token with requests
  return next(req);
  
  // const auth = inject(AuthService);
  // const token = auth.getToken();
  // if (!token) {
  //   return next(req);
  // }

  // const authReq = req.clone({
  //   setHeaders: {
  //     Authorization: `Bearer ${token}`
  //   }
  // });
  // return next(authReq);
};


