import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LogLevel, provideAuth } from 'angular-auth-oidc-client';

import { environment } from '../environments/environment';

import routeConfig from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import { provideTranslocoStandalone } from './transloco-root.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routeConfig),
    provideHttpClient(withInterceptors([authInterceptor])),
    ...provideTranslocoStandalone(),
    provideAuth({
      config: {
        authority: environment.idServerUrl,
        redirectUrl: `${environment.appHost}/signin-callback`,
        postLogoutRedirectUri: environment.appLogoutCallbackUrl,
        clientId: environment.oidcClientId,
        scope: environment.oidcScope,
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Warn,
      },
    }),
  ],
};
