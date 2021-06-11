
/***
 * Daily Behavior
 */
export class DailyBehavior {
    private _date: Date | undefined;
    private _goToBedTime: number | undefined;
    private _schoolWorkTime: number | undefined;
    private _additioanlWorkCount = 0;

    get currentDate(): Date | undefined {
        return this._date;
    }
    set currentDate(dt: Date | undefined) {
        this._date = dt;
    }
    get goToBedTime(): number | undefined {
        return this._goToBedTime;
    }
    set goToBedTime(stime: number | undefined) {
        this._goToBedTime = stime;
    }
    get schoolWorkTime(): number | undefined {
        return this._schoolWorkTime;
    }
    set schoolWorkTime(swtime: number | undefined) {
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

export class DailyAwardRule {
    private _point = 0;
    get point(): number {
        return this._point;
    }
    set point(pt: number) {
        this._point = pt;
    }

    private _ruleType : RuleType;
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
