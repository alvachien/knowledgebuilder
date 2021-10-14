/* eslint-disable @typescript-eslint/naming-convention */
import { User } from 'oidc-client';

/**
 * User detail
 */
export class UserDetail {
  public UserId = '';
  public DisplayAs = '';
  public Email = '';
  public Others = '';

  public onSetData(data: any): void {
    this.UserId = data.userID;
    this.DisplayAs = data.displayAs;
    this.Email = data.email;
    this.Others = data.others;
  }

  public onGetData(): any {
    const data: any = {};
    data.userID = this.UserId;
    data.displayAs = this.DisplayAs;
    data.email = this.Email;
    data.others = this.Others;

    return data;
  }
}

/**
 * User Auth Info
 */
export class UserAuthInfo {
  private currentUser: User | null = null;
  private userName: string | undefined = '';
  private userId = '';
  private userMailbox = '';
  private accessToken = '';

  public isAuthorized = false;

  public setContent(user: User): void {
    if (user) {
      this.currentUser = user;
      this.isAuthorized = true;

      this.userName = user.profile.name;
      this.userId = user.profile.sub;
      this.userMailbox = user.profile.mail;
      this.accessToken = user.access_token;
    } else {
      this.cleanContent();
    }
  }

  public cleanContent(): void {
    this.currentUser = null;
    this.isAuthorized = false;
    this.userName = '';
    this.userId = '';
    this.userMailbox = '';
    this.accessToken = '';
}

  public getUserName(): string {
    return this.userName ? this.userName : '';
  }
  public getUserId(): string {
    return this.userId;
  }
  public getAccessToken(): string {
    return this.accessToken;
  }
  public getUserMailbox(): string {
    return this.userMailbox;
  }
}
