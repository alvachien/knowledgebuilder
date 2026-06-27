import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserCodeService {
  private userCode: string = '';
  private _isUserCodeEntered = false;

  constructor() {
  }

  get isUserCodeEntered() : boolean {
    return this._isUserCodeEntered;
  }

  setUserCode(code: string) {
    this.userCode = code;
    this._isUserCodeEntered = true;
  }

  getUserCode(): string {
    return this.isUserCodeEntered ? this.userCode : '';
  }

  /** Clear stored user code — called on logout. */
  clearUserCode(): void {
    this.userCode = '';
    this._isUserCodeEntered = false;
  }
}
