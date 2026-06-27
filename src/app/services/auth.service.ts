import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { catchError, EMPTY, map, of, type Observable, type Subscription, TimeoutError } from 'rxjs';
import { BehaviorSubject, timeout } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserAuthInfo } from '../interfaces';

import { UserCodeService } from './user-code.service';

/** Time (ms) to wait when probing the IDP's well-known endpoint. */
const IDP_HEALTH_CHECK_TIMEOUT_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  public readonly authSubject = new BehaviorSubject<UserAuthInfo>(new UserAuthInfo());
  public readonly authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();

  private readonly oidc = inject(OidcSecurityService);
  private readonly events = inject(PublicEventsService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly userCodeService = inject(UserCodeService);

  /** Number of consecutive silent-renew failures — used to avoid infinite retry loops. */
  private _silentRenewFailures = 0;
  private _eventsSub?: Subscription;
  private _loginSub?: Subscription;

  constructor() {
    this._eventsSub = this.events.registerForEvents().subscribe((notification) => {
      switch (notification.type) {
        case EventTypes.NewAuthenticationResult:
          // Authentication result changed — checkAuth will handle state update.
          break;
        case EventTypes.TokenExpired:
        case EventTypes.IdTokenExpired:
          // Token expired — silent renew should handle this automatically
          // when useRefreshToken + silentRenew are enabled.
          break;
        case EventTypes.SilentRenewFailed:
          this._silentRenewFailures++;
          if (this._silentRenewFailures >= 3) {
            // Too many failures — surface the error instead of auto-redirecting
            // (which would loop if the IDP is down).
            this.authSubject.next(UserAuthInfo.createWithError('auth.session_expired'));
          } else {
            this.doLogin();
          }
          break;
      }
    });

    this.checkAuth();
  }

  ngOnDestroy(): void {
    this._eventsSub?.unsubscribe();
    this._loginSub?.unsubscribe();
  }

  /**
   * Probe the IDP's OpenID configuration endpoint to verify the server is reachable.
   * Returns `true` when the IDP responds, `false` otherwise.
   */
  public isIdpReachable(): Observable<boolean> {
    const wellKnownUrl = `${environment.idServerUrl}/.well-known/openid-configuration`;
    return this.http.get(wellKnownUrl, { responseType: 'text' }).pipe(
      timeout(IDP_HEALTH_CHECK_TIMEOUT_MS),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * Attempt to log in. If the IDP is unreachable, sets an error message
   * on `authSubject` instead of silently redirecting into a dead end.
   */
  public doLogin(): void {
    // Cancel any prior login health-check to prevent parallel requests
    this._loginSub?.unsubscribe();
    this._loginSub = this.isIdpReachable().subscribe((reachable) => {
      if (!reachable) {
        this.authSubject.next(UserAuthInfo.createWithError('auth.idp_unreachable'));
        return;
      }
      this.oidc.authorize();
    });
  }

  public doLogout(): void {
    this.oidc
      .logoffAndRevokeTokens()
      .pipe(
        catchError(() => {
          // IDP may be unreachable — still clean up local state so the user
          // isn't stuck in a half-logged-in state.
          return of(undefined);
        }),
      )
      .subscribe(() => {
        // Emit a new clean instance instead of mutating the existing one.
        this.authSubject.next(UserAuthInfo.createClean());
        // Clear stored user code on logout to prevent stale access credentials.
        this.userCodeService.clearUserCode();
      });
  }

  public checkAuth(): void {
    this.oidc
      .checkAuth()
      .pipe(
        catchError((err: unknown) => {
          const message =
            err instanceof TimeoutError
              ? 'auth.idp_timeout'
              : 'auth.check_auth_failed';
          this.authSubject.next(UserAuthInfo.createWithError(message));
          return EMPTY;
        }),
      )
      .subscribe(({ isAuthenticated, userData, accessToken }) => {
        if (isAuthenticated && accessToken) {
          this._silentRenewFailures = 0;
          this.authSubject.next(
            UserAuthInfo.createAuthenticated({
              userId: userData?.sub ?? '',
              userName: userData?.name ?? '',
              accessToken,
            })
          );
        } else {
          this.authSubject.next(UserAuthInfo.createClean());
        }
      });
  }

  /** Clear any error currently shown in the navbar. */
  public clearError(): void {
    // Emit a new instance preserving authentication state but clearing the error.
    this.authSubject.next(UserAuthInfo.createWithoutError(this.authSubject.value));
  }
}
