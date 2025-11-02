import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  
  let token = auth.getToken();
  
  if (!token) {
    try {
      token = localStorage.getItem('auth_token');
      if (token) {
        auth.setToken(token);
      }
    } catch (e) {
    }
  }
  
  if (req.url.includes('/auth/login') || !token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return next(authReq);
};


