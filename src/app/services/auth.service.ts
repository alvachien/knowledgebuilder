import { Injectable } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { filter } from 'rxjs';

import { InvitedUser } from '../models';
import { ODataService } from './odata.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;
  private _currentUserId = '';
  private _currentUserName = '';
  private _accessToken = '';  
  private _userDetail: InvitedUser | undefined;

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  get currentUserId(): string {
    return this._currentUserId;
  }
  get currentUserName(): string {
    return this._currentUserName;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  constructor(private authService: OidcSecurityService,
    private eventService: PublicEventsService,
    public oDataSrv: ODataService,) { 
    this.eventService
      .registerForEvents()
      // .pipe(filter((notification) => notification.type === EventTypes.CheckSessionReceived))
      .subscribe((value) => {
        switch(value.type) {
          case EventTypes.CheckSessionReceived:
            console.log("Check session received");
            break;
          case EventTypes.ConfigLoaded:
            console.log("Config loaded");
            break;
          case EventTypes.ConfigLoadingFailed:
            console.log("Config loading failed");
            break;            
          case EventTypes.UserDataChanged:
            console.log("User data changed");
            break;
          case EventTypes.NewAuthenticationResult:
            console.log("New authentication result");
            break;
          case EventTypes.TokenExpired:
            console.log("Token expired");
            break;
          case EventTypes.IdTokenExpired:
            console.log("ID token expired");
            break;
          case EventTypes.SilentRenewStarted:
            console.log("Silent renew started");
            break;
          default:
            break;
        } 
        console.log('CheckSessionChanged with value', value);
    });
    
    this.authService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken, idToken }) => {
      if (isAuthenticated) {
        this._isAuthenticated = true;
        this._currentUserId = userData.sub;
        this._currentUserName = userData.name;
        this._accessToken = accessToken;

        this.oDataSrv.getUserDetail().subscribe(val => {
          this._userDetail = val;
        });
      } else {
        this._isAuthenticated = false;
        this._currentUserId = '';
        this._currentUserName = '';
        this._accessToken = '';
      }
    });
  }

  public logon(): void {
    this.authService.authorize();
  }
}
