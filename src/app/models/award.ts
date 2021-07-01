/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */

import moment from 'moment';
import { momentDateFormat } from './uicommon';

/**
 * Award Rule
 */
export enum AwardRuleTypeEnum {
    goToBedTime = 1,
    schoolWorkTime = 2,
    homeWorkCount = 3,
    bodyExerciseCount = 4,
    errorCollectionHabit = 5,
    cleanDeakHabit = 6,
    houseKeepingCount = 7,
    politeBehavior = 8,
    handWritingHabit = 9,
}

export class AwardRule {
    id = -1;
    ruleType: AwardRuleTypeEnum = AwardRuleTypeEnum.goToBedTime;
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
            case AwardRuleTypeEnum.goToBedTime:
            case AwardRuleTypeEnum.schoolWorkTime:
                {
                    if (this.timeStart === undefined || this.timeEnd === undefined
                        || this.timeStart > this.timeEnd) {
                        return false;
                    }
                }
                break;

            case AwardRuleTypeEnum.homeWorkCount:
            case AwardRuleTypeEnum.bodyExerciseCount:
            case AwardRuleTypeEnum.houseKeepingCount:
            case AwardRuleTypeEnum.politeBehavior:
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

            case AwardRuleTypeEnum.errorCollectionHabit:
            case AwardRuleTypeEnum.cleanDeakHabit:
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

/***
 * Daily Behavior
 */
export class DailyBehavior {
    private _user: string | null = null;
    private _date: Date | null = null;
    private _goToBedTime = 0;
    private _schoolWorkTime = 0;
    private _additioanlWorkCount = 0;

    get user(): string | null {
        return this._user;
    }
    set user(ur: string | null) {
        this._user = ur;
    }
    get currentDate(): Date | null {
        return this._date;
    }
    set currentDate(dt: Date | null) {
        this._date = dt;
    }
    get goToBedTime(): number {
        return this._goToBedTime;
    }
    set goToBedTime(stime: number) {
        this._goToBedTime = stime;
    }
    get schoolWorkTime(): number {
        return this._schoolWorkTime;
    }
    set schoolWorkTime(swtime: number) {
        this._schoolWorkTime = swtime;
    }
    get additionalWorkCount(): number {
        return this._additioanlWorkCount;
    }
    set additionalWorkCount(cnt: number) {
        this._additioanlWorkCount = cnt;
    }
}

// eslint-disable-next-line no-shadow
export enum RuleType {
    goToBedTime = 1,
    schoolWorkTime = 2,
    additionalWorkCount = 3,
}

export interface AwardPoint {
    daysFrom: number;
    daysTo: number;
    point: number;
}

export interface ActivityTimeRange {
    taskstart: number;
    taskend: number;

    points: AwardPoint[];
}

export interface DailyAwardResult {
    user: string;
    currentDate: Date;
    goToBedPoint: number;
    schoolWorkPoint: number;
    goToBedContinousDays: number;
    schoolWorkContinousDays: number;
}

export class DailyAwardRule {
    public ranges: ActivityTimeRange[] = [];

    private _ruleType: RuleType = RuleType.goToBedTime;
    get ruleType(): RuleType { return this._ruleType; }
    set ruleType(rt: RuleType) { this._ruleType = rt; }
}

export class OneTimeAwardRule {
    private _point = 0;
    get point(): number {
        return this._point;
    }
    set point(pt: number) {
        this._point = pt;
    }
}
