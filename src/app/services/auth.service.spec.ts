import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { discardPeriodicTasks, fakeAsync, flush, inject, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { asyncData } from 'src/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let securService: any;
  let eventService: any;
  let checkAuthSpy: any;
  let authorizeSpy: any;
  let registerForEventsSpy: any;

  beforeAll(() => {
    securService = jasmine.createSpyObj('OidcSecurityService', [
      'checkAuth',
      'authorize',
    ]);
    checkAuthSpy = securService.checkAuth.and.returnValue(of({}));
    authorizeSpy = securService.authorize.and.returnValue();    
 
    eventService = jasmine.createSpyObj('PublicEventsService', [
      'registerForEvents',
    ]);
    registerForEventsSpy = eventService.registerForEvents.and.returnValue(of({}));
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: securService },
        { provide: PublicEventsService, useValue: eventService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  xit('shall not authorized by default', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated).toBeFalsy();
    expect(service.accessToken).toBeFalsy();
    expect(service.currentUserId).toBeFalsy();
    expect(service.currentUserName).toBeFalsy();
    expect(service.userDetail).toBeFalsy();
  });

  describe('work with authorized result', () => {
    beforeEach(() => {
      checkAuthSpy.and.returnValue(asyncData({isAuthenticated: true, userData: '', accessToken: 'abac', idToken: 'avc'}));
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    xit('shall authorized with positive result', fakeAsync(() => {
      authorizeSpy.and.callFake(() => {
        securService.checkAuth();
      });

      tick();
      service.logon();
      tick();
      flush();
      tick();

      expect(service.isAuthenticated).toBeTruthy();
      expect(service.accessToken).toBeTruthy();
      expect(service.currentUserId).toBeTruthy();
      expect(service.currentUserName).toBeTruthy();
      expect(service.userDetail).toBeFalsy(); 

      tick(); // complete the get user detail call.

      const callurl = `${environment.apiurlRoot}/InvitedUsers`;
      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });

      expect(req.request.params.get('$expand')).toEqual('AwardUsers');
    
      // Respond with the mock data
      req.flush({
        value: [{
          UserID: 'aaa',
          UserName: 'bbb',
          DisplayAs: 'ccc'
        }],
      });

      expect(service.userDetail).toBeTruthy();
      expect(service.userDetail?.userID).toEqual('aaa');
      expect(service.userDetail?.userName).toEqual('bbb');
      expect(service.userDetail?.displayAs).toEqual('ccc');

      discardPeriodicTasks();
    }));
  });
});

