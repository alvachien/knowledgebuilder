/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter, Injectable } from '@angular/core';
import { UserAuthInfo } from 'src/app/models';
import { environment } from 'src/environments/environment';
import { UserManager, Log, MetadataService, User } from 'oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';

const authSettings: any = {
  authority: environment.idServerUrl,
  client_id: 'knowledgebuilder.js',
  redirect_uri: environment.loginCallbackUrl,
  post_logout_redirect_uri: environment.logoutCallbackUrl,
  response_type: 'id_token token',
  // response_type: 'code',
  scope: 'openid profile api.knowledgebuilder',

  // silent_redirect_uri: environment.loginSlientRevewCallbackUrl,
  // automaticSilentRenew: true,
  // accessTokenExpiringNotificationTime: 4,
  // silentRequestTimeout:10000,

  filterProtocolClaims: true,
  loadUserInfo: true,
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private mgr: UserManager;

  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();
  public userLoadededEvent: EventEmitter<User> = new EventEmitter<User>();

  constructor() {
    this.mgr = new UserManager(authSettings);

    this.mgr.getUser().then((u: any) => {
      if (u) {
        // Set the content
        this.authSubject.value.setContent(u);

        // Broadcast event
        this.userLoadededEvent.emit(u);
      } else {
        this.authSubject.value.cleanContent();
      }

      this.authSubject.next(this.authSubject.value);
    }, (reason: any) => {
      console.error(reason);
    });

    this.mgr.events.addUserUnloaded(() => {
      this.authSubject.value.cleanContent();

      this.authSubject.next(this.authSubject.value);
    });

    this.mgr.events.addAccessTokenExpiring(() => {
      console.warn("Access token expiring");
    });

    this.mgr.events.addAccessTokenExpired(() => {
      console.warn("Access token expired");

      this.doLogin();
    });
  }

  public doLogin(): void {
    if (this.mgr) {
      this.mgr.signinRedirect().then(() => {
        console.log("Redirecting for Login");
      }).catch((er: any) => {
        console.error(er);
      });
    }
  }

  public doLogout(): void {
    if (this.mgr) {
      this.mgr.signoutRedirect().then(() => {
        console.log("Redirecting for Logout");
      }).catch((er: any) => {
        console.error(er);
      });
    }
  }

  clearState(): void {
    this.mgr.clearStaleState().then(() => {
      // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService clearState success...',
      //   ConsoleLogTypeEnum.debug);
    }).catch((er: any) => {
      console.error(er);
    });
  }

  getUser(): void {
    this.mgr.getUser().then((user: any) => {
      // console.debug(user);

      this.userLoadededEvent.emit(user);
    }).catch((err: any) => {
      console.error(err);
    });
  }

  removeUser(): void {
    this.mgr.removeUser().then(() => {
      // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService removeUser success...',
      //   ConsoleLogTypeEnum.debug);

      this.userLoadededEvent.emit(undefined);
    }).catch((err: any) => {
      console.error(err);
    });
  }

  startSigninMainWindow(): void {
    this.mgr.signinRedirect({ data: 'some data' }).then(() => {
      // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSigninMainWindow success...',
      //   ConsoleLogTypeEnum.debug);
    }).catch((err: any) => {
      console.error(err);
    });
  }

  endSigninMainWindow(): void {
    this.mgr.signinRedirectCallback().then((user: any) => {
      // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService endSigninMainWindow success...',
      //   ConsoleLogTypeEnum.debug);
    }).catch((err: any) => {
      console.error(err);
    });
  }

  startSignoutMainWindow(): void {
    this.mgr.signoutRedirect().then((resp: any) => {
      // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSignoutMainWindow success...',
      //   ConsoleLogTypeEnum.debug);

      setTimeout(() => {
        // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService startSignoutMainWindow, re-test...');
      }, 5000);
    }).catch((err: any) => {
      console.error(err);
    });
  }

  endSignoutMainWindow(): void {
    this.mgr.signoutRedirectCallback().then((resp: any) => {
      // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService endSignoutMainWindow success...',
      //   ConsoleLogTypeEnum.debug);
    }).catch((err: any) => {
      console.error(err);
    });
  }
}
