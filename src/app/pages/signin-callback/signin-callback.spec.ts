import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserAuthInfo } from '../../interfaces';
import type { UserLoginHistory } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { UserLoginHistoryService } from '../../services/user-login-history.service';

import { SigninCallbackComponent } from './signin-callback';

describe('SigninCallbackComponent', () => {
  let authContent: BehaviorSubject<UserAuthInfo>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let recordLoginSpy: ReturnType<typeof vi.fn>;
  let component: SigninCallbackComponent;

  const recordedDay: UserLoginHistory = {
    loginDate: '2026-10-05',
    firstLoginAt: '2026-10-05T01:00:00Z',
    lastLoginAt: '2026-10-05T01:00:00Z',
    loginCount: 1,
  };

  beforeEach(() => {
    authContent = new BehaviorSubject<UserAuthInfo>(new UserAuthInfo());
    navigateSpy = vi.fn();
    recordLoginSpy = vi.fn().mockReturnValue(of(recordedDay));

    TestBed.configureTestingModule({
      providers: [
        SigninCallbackComponent,
        { provide: AuthService, useValue: { authContent } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: UserLoginHistoryService, useValue: { recordLogin: recordLoginSpy } },
      ],
    });

    component = TestBed.inject(SigninCallbackComponent);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should not navigate while auth is still unsettled', () => {
    // The BehaviorSubject is seeded with the initial (unsettled) UserAuthInfo.
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(recordLoginSpy).not.toHaveBeenCalled();
  });

  it('should navigate to / once authenticated', () => {
    const info = new UserAuthInfo();
    info.setContent({ userId: 'u1', userName: 'Test', accessToken: 'tok' });
    authContent.next(info);

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should record today\'s login exactly once on a fresh authenticated redirect', () => {
    const info = new UserAuthInfo();
    info.setContent({ userId: 'u1', userName: 'Test', accessToken: 'tok' });
    authContent.next(info);

    expect(recordLoginSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to / when an error is surfaced (so the user is not stuck on the spinner)', () => {
    const info = new UserAuthInfo();
    info.setError('auth.idp_unreachable');
    authContent.next(info);

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(recordLoginSpy).not.toHaveBeenCalled();
  });

  it('should still navigate home when recording the login fails', () => {
    recordLoginSpy.mockReturnValue(throwError(() => new Error('HTTP 500')));
    const info = new UserAuthInfo();
    info.setContent({ userId: 'u1', userName: 'Test', accessToken: 'tok' });

    authContent.next(info);

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
