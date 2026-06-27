import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../environments/environment';
import { UserAuthInfo } from '../interfaces';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

describe('AuthGuardService', () => {
  let guard: AuthGuardService;
  let authServiceMock: {
    doLogin: ReturnType<typeof vi.fn>;
    authSubject: { getValue: () => UserAuthInfo };
  };

  beforeEach(() => {
    authServiceMock = {
      doLogin: vi.fn(),
      authSubject: {
        getValue: () => new UserAuthInfo(),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    guard = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when loginRequired is false', () => {
      const original = environment.loginRequired;
      (environment as any).loginRequired = false;

      const result = guard.canActivate({} as any, {} as any);
      expect(result).toBe(true);

      (environment as any).loginRequired = original;
    });

    it('should return true when user is authorized', () => {
      const original = environment.loginRequired;
      (environment as any).loginRequired = true;

      const authorizedInfo = new UserAuthInfo();
      authorizedInfo.setContent({ userId: 'u1', userName: 'Test', accessToken: 'tok' });
      authServiceMock.authSubject.getValue = () => authorizedInfo;

      const result = guard.canActivate({} as any, {} as any);
      expect(result).toBe(true);

      (environment as any).loginRequired = original;
    });

    it('should call doLogin and return false when not authorized and loginRequired', () => {
      const original = environment.loginRequired;
      (environment as any).loginRequired = true;

      // Default UserAuthInfo has isAuthorized = false
      authServiceMock.authSubject.getValue = () => new UserAuthInfo();

      const result = guard.canActivate({} as any, {} as any);
      expect(result).toBe(false);
      expect(authServiceMock.doLogin).toHaveBeenCalled();

      (environment as any).loginRequired = original;
    });

    it('should NOT call doLogin when an error is already surfaced', () => {
      const original = environment.loginRequired;
      (environment as any).loginRequired = true;

      const errorInfo = new UserAuthInfo();
      errorInfo.setError('auth.idp_unreachable');
      authServiceMock.authSubject.getValue = () => errorInfo;

      const result = guard.canActivate({} as any, {} as any);
      expect(result).toBe(false);
      expect(authServiceMock.doLogin).not.toHaveBeenCalled();

      (environment as any).loginRequired = original;
    });
  });
});
