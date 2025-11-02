import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token'); 
  if (!token) {
    return next(req);
  }
  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  return next(clonedReq);
};


