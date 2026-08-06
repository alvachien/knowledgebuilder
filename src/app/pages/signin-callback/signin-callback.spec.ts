import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserAuthInfo } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { SigninCallbackComponent } from './signin-callback';

describe('SigninCallbackComponent', () => {
  let authContent: BehaviorSubject<UserAuthInfo>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let component: SigninCallbackComponent;

  beforeEach(() => {
    authContent = new BehaviorSubject<UserAuthInfo>(new UserAuthInfo());
    navigateSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        SigninCallbackComponent,
        { provide: AuthService, useValue: { authContent } },
        { provide: Router, useValue: { navigate: navigateSpy } },
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
  });

  it('should navigate to / once authenticated', () => {
    const info = new UserAuthInfo();
    info.setContent({ userId: 'u1', userName: 'Test', accessToken: 'tok' });
    authContent.next(info);

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to / when an error is surfaced (so the user is not stuck on the spinner)', () => {
    const info = new UserAuthInfo();
    info.setError('auth.idp_unreachable');
    authContent.next(info);

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
