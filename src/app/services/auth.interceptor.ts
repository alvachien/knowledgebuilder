import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

/**
 * URLs that must carry the OIDC bearer token: the learning API
 * (`environment.apiUrl`) and acidserver (`environment.idServerUrl`) — the
 * habit invitation picker calls acidserver's `GET /api/users/search` with the
 * app's own `api.knowledgebuilder` audience token (shared auth contract in the
 * repo-root CLAUDE.md). Exact bases and everything under them match.
 */
function isBearerUrl(url: string): boolean {
  return (
    url === environment.apiUrl ||
    url.startsWith(environment.apiUrl + '/') ||
    url === environment.idServerUrl ||
    url.startsWith(environment.idServerUrl + '/')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isBearerUrl(req.url)) {
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
