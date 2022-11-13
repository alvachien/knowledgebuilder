import { TestBed } from '@angular/core/testing';
import { InvitedUser } from '../models';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

describe('AuthGuardService', () => {
  let service: AuthGuardService;
  let userDetail: InvitedUser;

  beforeEach(() => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authStub}
      ]      
    });
    service = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
