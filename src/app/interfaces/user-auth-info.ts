export class UserAuthInfo {
  private _userName?: string;
  private _userId?: string;
  private _accessToken?: string;
  private _errorMessage?: string;
  public isAuthorized = false;

  /** Create a new `UserAuthInfo` with authenticated content set. */
  public static createAuthenticated(user: {
    userId?: string;
    userName?: string;
    accessToken?: string;
  }): UserAuthInfo {
    const info = new UserAuthInfo();
    info.setContent(user);
    return info;
  }

  /** Create a new `UserAuthInfo` with an error message (not authorized). */
  public static createWithError(message: string): UserAuthInfo {
    const info = new UserAuthInfo();
    info.setError(message);
    return info;
  }

  /** Create a new empty/unauthorized `UserAuthInfo`, optionally preserving an error. */
  public static createClean(preserveError = false): UserAuthInfo {
    const info = new UserAuthInfo();
    if (preserveError) {
      // Caller can set the error separately if needed.
    }
    return info;
  }

  /** Create a new `UserAuthInfo` preserving authentication state but clearing any error. */
  public static createWithoutError(existing: UserAuthInfo): UserAuthInfo {
    const info = new UserAuthInfo();
    if (existing.isAuthorized) {
      info.setContent({
        userId: existing.getUserId(),
        userName: existing.getUserName(),
        accessToken: existing.getAccessToken(),
      });
    }
    return info;
  }

  public setContent(user: { userId?: string; userName?: string; accessToken?: string }): void {
    if (user) {
      this.isAuthorized = true;
      this._userName = user.userName;
      this._userId = user.userId;
      this._accessToken = user.accessToken;
      this._errorMessage = undefined;
    } else {
      this.cleanContent();
    }
  }

  public cleanContent(): void {
    this.isAuthorized = false;
    this._userName = undefined;
    this._userId = undefined;
    this._accessToken = undefined;
  }

  public setError(message: string): void {
    this.isAuthorized = false;
    this._errorMessage = message;
  }

  public clearError(): void {
    this._errorMessage = undefined;
  }

  public getUserName(): string | undefined {
    return this._userName;
  }

  public getUserId(): string | undefined {
    return this._userId;
  }

  public getAccessToken(): string | undefined {
    return this._accessToken;
  }

  public getErrorMessage(): string | undefined {
    return this._errorMessage;
  }
}
