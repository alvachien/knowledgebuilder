import moment from 'moment';
import { momentDateFormat } from './uicommon';

export class InvitedUser {
    public userID = '';
    public userName = '';
    public displayAs = '';
    public createdAt = moment();
    public lastLogonAt = moment();

    get createdAtString(): string {
        return this.createdAt.format(momentDateFormat);
    }
    get lastLogonAtString(): string {
        return this.lastLogonAt.format(momentDateFormat);
    }

    public parseData(val: any): void {
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
    }
}
