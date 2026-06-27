import { environment } from '../../environments/environment';

import type { AuthService } from './auth.service';

/**
 * Minimum interval (ms) between automatic login redirects triggered by the
 * guard. Prevents an infinite redirect loop when the IDP is down — after the
 * first failed attempt the `authSubject` carries an error message, so
 * subsequent navigations short-circuit here instead of calling `doLogin()`
 * again.
 */
const REDIRECT_COOLDOWN_MS = 10_000;

export interface GuardRedirectState {
  lastGuardRedirect: number;
}

export function checkAuthentication(
  authService: AuthService,
  state: GuardRedirectState
): boolean {
  if (!environment.loginRequired) {
    return true;
  }

  if (authService.authSubject.getValue().isAuthorized) {
    return true;
  }

  // If an error is already surfaced (IDP unreachable, etc.), don't keep
  // trying — let the user see the banner and retry manually.
  if (authService.authSubject.getValue().getErrorMessage()) {
    return false;
  }

  // Cooldown guard: don't redirect more than once per REDIRECT_COOLDOWN_MS.
  const now = Date.now();
  if (now - state.lastGuardRedirect < REDIRECT_COOLDOWN_MS) {
    return false;
  }

  state.lastGuardRedirect = now;
  authService.doLogin();
  return false;
}
