import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService  {
  constructor(private authService: OidcSecurityService, private router: Router) {}

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
  //   const url: string = state.url;

  //   return firstValueFrom(this.checkLogin(url));
  // }

  // checkLogin(url: string): Observable<boolean> {
  //   return this.authService.isAuthenticated().pipe(map((rst: boolean) => {
  //     if (!rst) {
  //       this.authService.authorize();
  //     }
  //     return true;
  //   }));
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => {
        // allow navigation if authenticated
        if (isAuthenticated) {
          return true;
        }

        // redirect if not authenticated
        return this.router.parseUrl('/unauthorized');
      })
    );
  }
}
