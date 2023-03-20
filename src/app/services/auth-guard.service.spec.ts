import { TestBed } from '@angular/core/testing';
import {
  OidcSecurityService,
  AuthenticatedResult,
} from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { InvitedUser } from '../models';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

describe('AuthGuardService', () => {
  let service: AuthGuardService;

  beforeEach(() => {
    const authStub: Partial<OidcSecurityService> = {
      isAuthenticated$: of({
        isAuthenticated: true,
      } as AuthenticatedResult),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: OidcSecurityService, useValue: authStub }],
    });
    service = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
