import moment from 'moment';
import { AwardUserView } from './award';
import { momentDateFormat } from './uicommon';
import { SafeAny } from '../common';

export class InvitedUser {
  public userID = '';
  public userName = '';
  public displayAs = '';
  public createdAt = moment();
  public lastLogonAt = moment();

  public awardUsers: AwardUserView[] = [];

  get createdAtString(): string {
    return this.createdAt.format(momentDateFormat);
  }
  get lastLogonAtString(): string {
    return this.lastLogonAt.format(momentDateFormat);
  }

  public parseData(val: SafeAny): void {
    if (val && val.UserID) {
      this.userID = val.UserID;
    }
    if (val && val.UserName) {
      this.userName = val.UserName;
    }
    if (val && val.DisplayAs) {
      this.displayAs = val.DisplayAs;
    }
    if (val && val.CreatedAt) {
      this.createdAt = moment(val.CreatedAt);
    }
    if (val && val.LastLoginAt) {
      this.lastLogonAt = moment(val.LastLoginAt);
    }

    if (val && val.AwardUsers) {
      const items: SafeAny[] = val.AwardUsers as SafeAny[];
      items.forEach((tg) => {
        const wuv = new AwardUserView();
        wuv.parseData(tg);
        this.awardUsers.push(wuv);
      });
    }
  }
}
