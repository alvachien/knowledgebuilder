import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl + '/') || req.url === environment.apiUrl) {
    const oidc = inject(OidcSecurityService);
    return oidc.getAccessToken().pipe(
      switchMap((token) => {
        if (token) {
          req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next(req);
      }),
    );
  }
  return next(req);
};
