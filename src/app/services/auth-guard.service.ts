import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, type Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { checkAuthentication, type GuardRedirectState } from './auth-check.util';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private readonly authService = inject(AuthService);

  /** Instance-level cooldown state - avoids module-level mutable globals. */
  private readonly _guardState: GuardRedirectState = { lastGuardRedirect: 0 };

  /**
   * Waits for the initial `checkAuth()` to settle before deciding, so a fresh load
   * of a protected route with a valid session is allowed instead of bouncing to the
   * IDP (H3). Fast paths return synchronously when login isn't required or the user
   * is already authenticated (e.g. in-app navigation between guarded routes).
   */
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!environment.loginRequired) {
      return true;
    }
    if (this.authService.authSubject.getValue().isAuthorized) {
      return true;
    }
    // Not yet authenticated - wait for the initial auth check to settle, then run
    // the synchronous decide/redirect logic.
    return this.authService.waitForAuthCheck().pipe(
      map(() => checkAuthentication(this.authService, this._guardState))
    );
  }
}
