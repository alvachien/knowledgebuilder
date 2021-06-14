
/***
 * Daily Behavior
 */
export class DailyBehavior {
    private _user: string | null = null;
    private _date: Date | null = null;
    private _goToBedTime: number = 0;
    private _schoolWorkTime: number = 0;
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
    goToBedTime             = 1,
    schoolWorkTime          = 2,
    additionalWorkCount     = 3,
}

export interface AwardPoint {
    days: number;
    point: number;
}

export interface ActivityTimeRange {
    taskstart: number;
    taskend: number;
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
    public points: AwardPoint[] = [];
    public range: ActivityTimeRange | null = null;

    private _ruleType: RuleType = RuleType.goToBedTime;
    get ruleType(): RuleType    { return this._ruleType;    }
    set ruleType(rt: RuleType)  { this._ruleType = rt;      }
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
