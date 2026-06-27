import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { checkAuthentication, type GuardRedirectState } from './auth-check.util';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private readonly authService = inject(AuthService);

  /** Instance-level cooldown state — avoids module-level mutable globals. */
  private readonly _guardState: GuardRedirectState = { lastGuardRedirect: 0 };

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    return checkAuthentication(this.authService, this._guardState);
  }
}
