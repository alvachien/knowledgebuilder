/* eslint-disable no-underscore-dangle */

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
    ID: number;
    RuleType: AwardRuleTypeEnum;
    TargetUser: string;
    Desp: string;
    ValidFrom: moment.Moment;
    ValidTo: moment.Moment;
    CoutOfFactLow?: number;
    CoutOfFactHigh?: number;
    DoneOfFact?: boolean;
    TimeStart?: number;
    TimeEnd?: number;
    DaysFrom?: number;
    DaysTo?: number;
    Point: number;

    public IsValid(): boolean {
        if (!this.TargetUser) {
            return false;
        }
        if (!this.Desp) {
            return false;
        }

        switch (RuleType) {
            case AwardRuleTypeEnum.GoToBedTime:
            case AwardRuleTypeEnum.SchoolWorkTime:
                if (this.TimeStart === undefined || this.TimeEnd === undefined
                    || this.TimeStart > this.TimeEnd)
                    return false;
                break;

            case AwardRuleTypeEnum.HomeWorkCount:
            case AwardRuleTypeEnum.BodyExerciseCount:
            case AwardRuleTypeEnum.HouseKeepingCount:
            case AwardRuleTypeEnum.PoliteBehavior:
                if (this.CountOfFactLow === undefined)
                    return false;
                if (this.CountOfFactHigh === undefined)
                    return false;
                if (this.CountOfFactLow > this.CountOfFactHigh)
                    return false;
                break;

            case AwardRuleTypeEnum.ErrorCollectionHabit:
            case AwardRuleTypeEnum.CleanDeakHabit:
                if (this.DoneOfFact === undefined)
                    return false;
                break;

            default:
                return false;
        }

        return true;
    }
}

export class DailyTrace {
    TargetUser: string;
    RecordDate: moment.Moment;
    SchoolWorkTime?: number;
    GoToBedTime?: number;
    HomeWorkCount?: number;
    BodyExerciseCount?: number;
    ErrorsCollection?: boolean;
    HandWriting?: boolean;
    CleanDesk?: boolean;
    HouseKeepingCount?: number;
    PoliteBehavior?: number;
    Comment: string;
}

export class AwardPoint {
    ID: number;
    TargetUser: string;
    RecordDate: moment.Moment;
    MatchedRuleID?: number;
    CountOfDay?: number;
    Point: number;
    Comment: string;
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
