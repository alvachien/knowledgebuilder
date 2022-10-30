import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: OidcSecurityService) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {

    this.authService.isAuthenticated().subscribe((rst: boolean) => {

    });

    this.authService.authorize();

    return false;
  }
}
