import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { catchError, filter, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { InvitedUser } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;
  private _currentUserId = '';
  private _currentUserName = '';
  private _accessToken = '';  
  private _userDetail: InvitedUser | undefined;
  private expertModeFailMsg = 'Cannot perform required opertion, need Login';
  private contentType = 'Content-Type';
  private appJson = 'application/json';
  private strAccept = 'Accept';

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  set isAuthenticated(isAuth: boolean) {
    this._isAuthenticated = isAuth;
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
  get userDetail(): InvitedUser | undefined {
    return this._userDetail;
  }

  constructor(private authService: OidcSecurityService,
    private eventService: PublicEventsService,
    private http: HttpClient,) { 
    this.eventService
      .registerForEvents()
      // .pipe(filter((notification) => notification.type === EventTypes.CheckSessionReceived))
      .subscribe((value) => {
        switch(value.type) {
          case EventTypes.CheckSessionReceived:
            console.debug("Check session received");
            break;
          case EventTypes.ConfigLoaded:
            console.debug("Config loaded");
            break;
          case EventTypes.ConfigLoadingFailed:
            console.debug("Config loading failed");
            break;            
          case EventTypes.UserDataChanged:
            console.debug("User data changed");
            break;
          case EventTypes.NewAuthenticationResult:
            console.debug("New authentication result");
            this.checkAuth();
            break;
          case EventTypes.TokenExpired:
            console.debug("Token expired");
            break;
          case EventTypes.IdTokenExpired:
            console.debug("ID token expired");
            break;
          case EventTypes.SilentRenewStarted:
            console.debug("Silent renew started");
            break;
          default:
            break;
        } 
        console.debug(`CheckSessionChanged with value ${value}`);
    });
    this.checkAuth();
  }

  private checkAuth() {
    this.authService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
      console.debug(`checkAuth with value ${isAuthenticated}, ${accessToken}`);
      if (isAuthenticated) {
        this._isAuthenticated = true;
        this._currentUserId = userData.sub;
        this._currentUserName = userData.name;
        this._accessToken = accessToken;

        this.getUserDetail().subscribe();
      } else {
        this._isAuthenticated = false;
        this._currentUserId = '';
        this._currentUserName = '';
        this._accessToken = '';
        this._userDetail = undefined;
      }
    });
  }

  public logon(): void {
    this.authService.authorize();
  }
  public logout(): void {
    this.authService.logoffAndRevokeTokens().subscribe(() => {
      this._isAuthenticated = false;
      this._currentUserId = '';
      this._currentUserName = '';
      this._accessToken = '';
      this._userDetail = undefined;
    });
  }

  public getUserDetail(): Observable<InvitedUser> {
    if (!this.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }

    const apiurl = `${environment.apiurlRoot}/InvitedUsers`;
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.accessToken);;
    let params: HttpParams = new HttpParams();
    params = params.append('$expand', 'AwardUsers');

    return this.http.get(apiurl, {
      headers,
      params,
    })
    .pipe(map(response => {
      const rjs = response as any;
      const ritems = rjs.value as any[];
      if (ritems.length !== 1) {
        throwError(() => new Error('Fatal error'));
      }

      this._userDetail = new InvitedUser();
      this._userDetail.parseData(ritems[0]);

      return this._userDetail;
    }),
    catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));      
  }
}
