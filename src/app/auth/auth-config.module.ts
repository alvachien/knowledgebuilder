import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';


@NgModule({
    imports: [AuthModule.forRoot({
        config: {
            authority: environment.idServerUrl,
            redirectUrl: window.location.origin,
            postLogoutRedirectUri: window.location.origin,

            clientId: 'knowledgebuilder.js',
            scope: 'openid profile api.knowledgebuilder offline_access', // 'openid profile ' + your scopes
            responseType: 'code',

            silentRenew: true,
            useRefreshToken: true,
            // silentRenewUrl: window.location.origin + '/silent-renew.html',
            renewTimeBeforeTokenExpiresInSeconds: 10,
        }
      })],
    exports: [AuthModule],
})
export class AuthConfigModule {}
