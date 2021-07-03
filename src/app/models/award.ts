/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */

import moment from 'moment';
import { momentDateFormat } from './uicommon';

/**
 * Award Rule
 */
export enum AwardRuleTypeEnum {
    GoToBedTime = 1,
    SchoolWorkTime = 2,
    HomeWorkCount = 3,
    BodyExerciseCount = 4,
    ErrorCollectionHabit = 5,
    CleanDeakHabit = 6,
    HouseKeepingCount = 7,
    PoliteBehavior = 8,
    HandWritingHabit = 9,
}

export class AwardRule {
    id = -1;
    ruleType: AwardRuleTypeEnum = AwardRuleTypeEnum.GoToBedTime;
    targetUser = '';
    desp = '';
    validFrom: moment.Moment = moment();
    validTo: moment.Moment = moment();
    countOfFactLow?: number;
    countOfFactHigh?: number;
    doneOfFact?: boolean;
    timeStart?: number;
    timeEnd?: number;
    daysFrom?: number;
    daysTo?: number;
    point = 0;

    public isValid(): boolean {
        if (!this.targetUser) {
            return false;
        }
        if (!this.desp) {
            return false;
        }

        switch (this.ruleType) {
            case AwardRuleTypeEnum.GoToBedTime:
            case AwardRuleTypeEnum.SchoolWorkTime:
                {
                    if (this.timeStart === undefined || this.timeEnd === undefined
                        || this.timeStart > this.timeEnd) {
                        return false;
                    }
                }
                break;

            case AwardRuleTypeEnum.HomeWorkCount:
            case AwardRuleTypeEnum.BodyExerciseCount:
            case AwardRuleTypeEnum.HouseKeepingCount:
            case AwardRuleTypeEnum.PoliteBehavior:
                {
                    if (this.countOfFactLow === undefined) {
                        return false;
                    }
                    if (this.countOfFactHigh === undefined) {
                        return false;
                    }
                    if (this.countOfFactLow > this.countOfFactHigh) {
                        return false;
                    }
                }
                break;

            case AwardRuleTypeEnum.ErrorCollectionHabit:
            case AwardRuleTypeEnum.CleanDeakHabit:
                {
                    if (this.doneOfFact === undefined) {
                        return false;
                    }
                }
                break;

            default:
                return false;
        }

        return true;
    }

    public parseData(val: any): void {
        if (val && val.ID) {
            this.id = +val.ID;
        }
        if (val && val.RuleType) {
            if (isNaN(+val.RuleType)) {
                this.ruleType = AwardRuleTypeEnum[val.RuleType as keyof typeof AwardRuleTypeEnum];
            } else {
                this.ruleType = +val.RuleType;
            }
        }
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.Desp) {
            this.desp = val.Desp;
        }
        if (val && val.ValidFrom) {
            this.validFrom = moment(val.ValidFrom);
        }
        if (val && val.ValidTo) {
            this.validTo = moment(val.ValidTo);
        }
        if (val && val.CountOfFactLow) {
            this.countOfFactLow = val.CountOfFactLow;
        }
        if (val && val.CountOfFactHigh) {
            this.countOfFactHigh = val.CountOfFactHigh;
        }
        if (val && val.DoneOfFact) {
            this.doneOfFact = val.DoneOfFact;
        }
        if (val && val.TimeStart) {
            this.timeStart = val.TimeStart;
        }
        if (val && val.TimeEnd) {
            this.timeEnd = val.TimeEnd;
        }
        if (val && val.DaysFrom) {
            this.daysFrom = val.DaysFrom;
        }
        if (val && val.DaysTo) {
            this.daysTo = val.DaysTo;
        }
        if (val && val.Point) {
            this.point = val.Point;
        }
    }
    public writeJSONObject(isCreatedMode = true): any {
        const jobj: any =  { };
        if (!isCreatedMode) {
            jobj.ID = this.id;
        }
        jobj.RuleType = AwardRuleTypeEnum[this.ruleType],
        jobj.TargetUser = this.targetUser;
        jobj.Desp = this.desp;
        jobj.ValidFrom = this.validFrom.format(momentDateFormat);
        jobj.ValidTo = this.validTo.format(momentDateFormat);
        if (this.countOfFactLow) {
            jobj.CountOfFactLow = this.countOfFactLow;
        }
        if (this.countOfFactHigh) {
            jobj.CountOfFactHigh = this.countOfFactHigh;
        }
        if (this.doneOfFact) {
            jobj.DoneOfFact = this.doneOfFact;
        }
        if (this.timeStart) {
            jobj.TimeStart = this.timeStart;
        }
        if (this.timeEnd) {
            jobj.TimeEnd = this.timeEnd;
        }
        if (this.daysFrom) {
            jobj.DaysFrom = this.daysFrom;
        }
        if (this.daysTo) {
            jobj.DaysTo = this.daysTo;
        }
        jobj.Point = this.point;

        return jobj;
    }
    public writeJSONString(isCreatedMode = true): string {
        return JSON && JSON.stringify(this.writeJSONObject(isCreatedMode));
    }
}

export class DailyTrace {
    targetUser = '';
    recordDate: moment.Moment = moment();
    schoolWorkTime: number | null = null;
    goToBedTime: number | null = null;
    homeWorkCount: number | null = null;
    bodyExerciseCount: number | null = null;
    errorsCollection: boolean | null = null;
    handWriting: boolean | null = null;
    cleanDesk: boolean | null = null;
    houseKeepingCount: number | null = null;
    politeBehavior: number | null = null;
    comment = '';

    public getRecordDateDisplayString(): string {
        return this.recordDate.format(momentDateFormat);
    }

    public isValid(): boolean {
        if (!this.targetUser) {
            return false;
        }
        if (this.schoolWorkTime === null
            && this.goToBedTime === null
            && this.homeWorkCount === null
            && this.bodyExerciseCount === null
            && this.errorsCollection === null
            && this.handWriting === null
            && this.cleanDesk === null
            && this.houseKeepingCount === null
            && this.politeBehavior === null) {
            return false;
        }
        return true;
    }

    public parseData(val: any): void {
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.GoToBedTime !== undefined) {
            this.goToBedTime = val.GoToBedTime;
        }
        if (val && val.SchoolWorkTime !== undefined) {
            this.schoolWorkTime = val.SchoolWorkTime;
        }
        if (val && val.HomeWorkCount !== undefined) {
            this.homeWorkCount = val.HomeWorkCount;
        }
        if (val && val.BodyExerciseCount !== undefined) {
            this.bodyExerciseCount = val.BodyExerciseCount;
        }
        if (val && val.errorsCollection !== undefined) {
            this.errorsCollection = val.ErrorsCollection;
        }
        if (val && val.HandWriting !== undefined) {
            this.handWriting = val.HandWriting;
        }
        if (val && val.CleanDesk !== undefined) {
            this.cleanDesk = val.CleanDesk;
        }
        if (val && val.HouseKeepingCount !== undefined) {
            this.houseKeepingCount = val.HouseKeepingCount;
        }
        if (val && val.PoliteBehavior !== undefined) {
            this.politeBehavior = val.PoliteBehavior;
        }
        if (val && val.Comment !== undefined) {
            this.comment = val.Comment;
        }
    }
    public writeJSONObject(): any {
        const jobj: any =  { };
        jobj.TargetUser = this.targetUser;
        jobj.RecordDate = this.recordDate.format(momentDateFormat);
        if (this.goToBedTime !== null) {
            jobj.GoToBedTime = this.goToBedTime;
        }
        if (this.schoolWorkTime !== null) {
            jobj.SchoolWorkTime = this.schoolWorkTime;
        }
        if (this.homeWorkCount !== null) {
            jobj.HomeWorkCount = this.homeWorkCount;
        }
        if (this.bodyExerciseCount !== null) {
            jobj.BodyExerciseCount = this.bodyExerciseCount;
        }
        if (this.errorsCollection !== null) {
            jobj.ErrorsCollection = this.errorsCollection;
        }
        if (this.handWriting !== null) {
            jobj.HandWriting = this.handWriting;
        }
        if (this.cleanDesk !== null) {
            jobj.CleanDesk = this.cleanDesk;
        }
        if (this.houseKeepingCount !== null) {
            jobj.HouseKeepingCount = this.houseKeepingCount;
        }
        if (this.politeBehavior !== null) {
            jobj.PoliteBehavior = this.politeBehavior;
        }
        if (this.comment) {
            jobj.Comment = this.comment;
        }

        return jobj;
    }
    public writeJSONString(): string {
        return JSON && JSON.stringify(this.writeJSONObject());
    }
}

export class AwardPoint {
    id = 1;
    targetUser = '';
    recordDate: moment.Moment = moment();
    matchedRuleID?: number;
    countOfDay?: number;
    point = 0;
    comment = '';

    public getRecordDateDisplayString(): string {
        return this.recordDate.format(momentDateFormat);
    }

    public parseData(val: any): void {
        if (val && val.ID) {
            this.id = val.ID;
        }
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.MatchedRuleID) {
            this.matchedRuleID = val.MatchedRuleID;
        }
        if (val && val.CountOfDay) {
            this.countOfDay = val.CountOfDay;
        }
        if (val && val.Point) {
            this.point = val.Point;
        }
        if (val && val.Comment) {
            this.comment = val.Comment;
        }
    }
}

export class AwardPointReport {
    targetUser = '';
    recordDate: moment.Moment = moment();
    point = 0;

    public getRecordDateDisplayString(): string {
        return this.recordDate.format(momentDateFormat);
    }
    public parseData(val: any): void {
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.Point) {
            this.point = val.Point;
        }
    }
}
