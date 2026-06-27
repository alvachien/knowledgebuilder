import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserAuthInfo } from '../interfaces';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let oidcSpy: {
    checkAuth: ReturnType<typeof vi.fn>;
    authorize: ReturnType<typeof vi.fn>;
    logoffAndRevokeTokens: ReturnType<typeof vi.fn>;
  };
  let httpSpy: { get: ReturnType<typeof vi.fn> };
  let eventsSubject: Subject<{ type: EventTypes }>;

  beforeEach(() => {
    eventsSubject = new Subject();

    oidcSpy = {
      checkAuth: vi.fn().mockReturnValue(
        of({ isAuthenticated: false, userData: null, accessToken: null }),
      ),
      authorize: vi.fn(),
      logoffAndRevokeTokens: vi.fn().mockReturnValue(of(null)),
    };

    httpSpy = {
      get: vi.fn().mockReturnValue(of('ok')),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: oidcSpy },
        {
          provide: PublicEventsService,
          useValue: { registerForEvents: () => eventsSubject.asObservable() },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: HttpClient, useValue: httpSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should call checkAuth on init', () => {
      expect(oidcSpy.checkAuth).toHaveBeenCalled();
    });

    it('should set authSubject to unauthorized when checkAuth returns not authenticated', () => {
      const value = service.authSubject.getValue();
      expect(value.isAuthorized).toBe(false);
    });
  });

  describe('doLogin', () => {
    it('should call oidc.authorize() when IDP is reachable', () => {
      httpSpy.get.mockReturnValue(of('ok'));
      service.doLogin();
      expect(oidcSpy.authorize).toHaveBeenCalled();
    });

    it('should set error when IDP is unreachable', () => {
      httpSpy.get.mockReturnValue(throwError(() => new Error('Network error')));
      service.doLogin();
      const value = service.authSubject.getValue();
      expect(value.isAuthorized).toBe(false);
      expect(value.getErrorMessage()).toBe('auth.idp_unreachable');
      expect(oidcSpy.authorize).not.toHaveBeenCalled();
    });
  });

  describe('doLogout', () => {
    it('should call oidc.logoffAndRevokeTokens and clean authSubject', () => {
      oidcSpy.checkAuth.mockReturnValue(
        of({
          isAuthenticated: true,
          userData: { sub: 'user-123', name: 'Test' },
          accessToken: 'tok',
        }),
      );
      service.checkAuth();
      expect(service.authSubject.getValue().isAuthorized).toBe(true);

      service.doLogout();
      expect(oidcSpy.logoffAndRevokeTokens).toHaveBeenCalled();
      expect(service.authSubject.getValue().isAuthorized).toBe(false);
      expect(service.authSubject.getValue().getUserName()).toBeUndefined();
    });

    it('should still clean local state when IDP revoke call fails', () => {
      oidcSpy.logoffAndRevokeTokens.mockReturnValue(
        throwError(() => new Error('IDP down')),
      );

      // Set as authorized first
      oidcSpy.checkAuth.mockReturnValue(
        of({
          isAuthenticated: true,
          userData: { sub: 'u', name: 'T' },
          accessToken: 't',
        }),
      );
      service.checkAuth();
      expect(service.authSubject.getValue().isAuthorized).toBe(true);

      service.doLogout();
      expect(service.authSubject.getValue().isAuthorized).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should populate authSubject when authenticated', () => {
      oidcSpy.checkAuth.mockReturnValue(
        of({
          isAuthenticated: true,
          userData: { sub: 'user-123', name: 'Test User' },
          accessToken: 'test-token',
        }),
      );
      service.checkAuth();
      const value = service.authSubject.getValue();
      expect(value.isAuthorized).toBe(true);
      expect(value.getUserName()).toBe('Test User');
      expect(value.getUserId()).toBe('user-123');
      expect(value.getAccessToken()).toBe('test-token');
    });

    it('should clean authSubject when not authenticated', () => {
      oidcSpy.checkAuth.mockReturnValue(
        of({ isAuthenticated: false, userData: null, accessToken: null }),
      );
      service.checkAuth();
      const value = service.authSubject.getValue();
      expect(value.isAuthorized).toBe(false);
      expect(value.getUserName()).toBeUndefined();
    });

    it('should set error when checkAuth throws', () => {
      oidcSpy.checkAuth.mockReturnValue(
        throwError(() => new Error('IDP unreachable')),
      );
      service.checkAuth();
      const value = service.authSubject.getValue();
      expect(value.isAuthorized).toBe(false);
      expect(value.getErrorMessage()).toBe('auth.check_auth_failed');
    });
  });

  describe('event handling', () => {
    it('should call doLogin on first SilentRenewFailed event', () => {
      const loginSpy = vi.spyOn(service, 'doLogin');
      eventsSubject.next({ type: EventTypes.SilentRenewFailed });
      expect(loginSpy).toHaveBeenCalledTimes(1);
    });

    it('should set error after 3 consecutive SilentRenewFailed events', () => {
      // Mock IDP reachable so doLogin doesn't get stuck
      httpSpy.get.mockReturnValue(of('ok'));

      eventsSubject.next({ type: EventTypes.SilentRenewFailed });
      eventsSubject.next({ type: EventTypes.SilentRenewFailed });
      eventsSubject.next({ type: EventTypes.SilentRenewFailed });

      const value = service.authSubject.getValue();
      expect(value.getErrorMessage()).toBe('auth.session_expired');
    });
  });

  describe('clearError', () => {
    it('should clear the error message', () => {
      // Set an error
      const info = service.authSubject.getValue();
      info.setError('auth.idp_unreachable');
      service.authSubject.next(info);
      expect(service.authSubject.getValue().getErrorMessage()).toBe('auth.idp_unreachable');

      service.clearError();
      expect(service.authSubject.getValue().getErrorMessage()).toBeUndefined();
    });

    it('should preserve authentication state when clearing error', () => {
      // Scenario: an error was set (which clears isAuthorized), then dismissed.
      // After dismissing, the state should be clean unauthorized (not re-authorized,
      // but also not carrying stale error).
      const info = UserAuthInfo.createWithError('auth.idp_unreachable');
      service.authSubject.next(info);

      const before = service.authSubject.getValue();
      expect(before.isAuthorized).toBe(false);
      expect(before.getErrorMessage()).toBe('auth.idp_unreachable');

      service.clearError();

      const after = service.authSubject.getValue();
      expect(after.isAuthorized).toBe(false);
      expect(after.getErrorMessage()).toBeUndefined();
      expect(after.getUserId()).toBeUndefined();
      expect(after.getUserName()).toBeUndefined();
    });

    it('should preserve auth fields when clearing error on an authorized instance', () => {
      // Edge case: if somehow an authorized UserAuthInfo has an error
      // (shouldn't happen with current setError, but guard against future changes)
      const info = UserAuthInfo.createAuthenticated({
        userId: 'user-123',
        userName: 'Test User',
        accessToken: 'test-token',
      });
      // Manually set error WITHOUT clearing auth (bypassing setError)
      (info as any)._errorMessage = 'some.warning';
      service.authSubject.next(info);

      const before = service.authSubject.getValue();
      expect(before.isAuthorized).toBe(true);
      expect(before.getUserId()).toBe('user-123');
      expect(before.getErrorMessage()).toBe('some.warning');

      service.clearError();

      const after = service.authSubject.getValue();
      expect(after.isAuthorized).toBe(true);
      expect(after.getUserId()).toBe('user-123');
      expect(after.getUserName()).toBe('Test User');
      expect(after.getAccessToken()).toBe('test-token');
      expect(after.getErrorMessage()).toBeUndefined();
    });
  });
});
