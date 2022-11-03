import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: OidcSecurityService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const url: string = state.url;

    return firstValueFrom(this.checkLogin(url));
  }

  checkLogin(url: string): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(map((rst: boolean) => {
      if (!rst) {
        this.authService.authorize();
      }
      return true;
    }));
  }
}
