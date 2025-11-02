import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  
  // Always try to get fresh token from localStorage as fallback
  let token = auth.getToken();
  
  // If token is null from signal, try reading directly from localStorage
  if (!token) {
    try {
      token = localStorage.getItem('auth_token');
      if (token) {
        // Update signal if we found token in localStorage
        auth.setToken(token);
      }
    } catch (e) {
      // Silent fail - localStorage might not be available
    }
  }
  
  // Skip adding token for login endpoint
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


