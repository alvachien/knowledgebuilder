import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LogLevel, provideAuth } from 'angular-auth-oidc-client';

import { environment } from '../environments/environment';

import routeConfig from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import { UserLearningTimeService } from './services/user-learning-time.service';
import { provideTranslocoStandalone } from './transloco-root.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // No withInMemoryScrolling({anchorScrolling}) here on purpose: this app scrolls inside
    // `.app-main-content` (overflow-y: auto), not the window, and the router's viewport
    // scroller calls window.scrollTo — a visible no-op with an inner scroller. The help
    // page's TOC fragment jumps scroll themselves in HelpContentComponent (scrollIntoView).
    // Plain `href="#x"` anchors cannot be used anywhere in this app either: the document
    // <base href> (dev "/", prod "/learning/") resolves fragment-only URLs against the
    // BASE, not the current route, so a click would load "/" (the homepage).
    provideRouter(routeConfig),
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
    // Construct the learning-time heartbeat at bootstrap (it is otherwise never
    // injected by any screen; root-provided services stay lazy). It only POSTs
    // while an exercise route is visible and the user is active - see the service.
    provideAppInitializer(() => {
      void inject(UserLearningTimeService);
    }),
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
