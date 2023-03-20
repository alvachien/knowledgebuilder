import { NgModule } from '@angular/core';
import { AuthModule, LogLevel } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';

@NgModule({
  imports: [
    AuthModule.forRoot({
      config: {
        authority: environment.idServerUrl,
        redirectUrl: environment.AppHost, // window.location.origin,
        postLogoutRedirectUri: environment.AppHost, // window.location.origin,

        clientId: 'knowledgebuilder.js',
        scope: 'openid profile api.knowledgebuilder offline_access', // 'openid profile ' + your scopes
        responseType: 'code',

        silentRenew: true,
        useRefreshToken: true,
        // silentRenewUrl: window.location.origin + '/silent-renew.html',
        // renewTimeBeforeTokenExpiresInSeconds: 666,
        // tokenRefreshInSeconds: 600,

        // disableIdTokenValidation: true,
        //ignoreNonceAfterRefresh: true, // this is required if the id_token is not returned
        // allowUnsafeReuseRefreshToken: true, // this is required if the refresh token is not rotated
        //triggerRefreshWhenIdTokenExpired: false, // required to refresh the browser if id_token is not updated after the first authentication
        //autoUserInfo: false, // if the user endpoint is not supported
        logLevel: LogLevel.Error,
      },
    }),
  ],
  exports: [AuthModule],
})
export class AuthConfigModule {}
