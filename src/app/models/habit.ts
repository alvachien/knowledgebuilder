//
// Models for Habit
//

import moment from 'moment';
import { momentDateFormat } from '.';

// Habit category: good habit or bad habit
export enum HabitCategory
{
    Positive = 0,
    Negative = 1,
}

export const getHabitCategoryName = (ctgy: HabitCategory): string => {
    let rtn = '';
    switch (ctgy) {
        case HabitCategory.Positive: rtn = 'Habit.GoodHabit'; break;
        case HabitCategory.Negative: 
        default:                     rtn = 'Habit.BadHabit'; break;
    }
    return rtn;
};

export const getHabitCategoryNames = (): any[] => {
    const rtn = [];

    for (const se in HabitCategory) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        rtn.push({
          value: +se,
          i18nterm: getHabitCategoryName(+se),
          displaystring: '',
        });
      }
    }

    return rtn;
};

// Habit frequency
export enum HabitFrequency
{
    Daily       = 0,
    Weekly      = 1,
    Monthly     = 2
}

export const getHabitFrequencyName = (freq: HabitFrequency): string => {
    let rtn = '';
    switch (freq) {
        case HabitFrequency.Monthly:    rtn = 'Habit.Monthly';  break;
        case HabitFrequency.Weekly:     rtn = 'Habit.Weekly';   break;
        case HabitFrequency.Daily:
            default:                    rtn = 'Habit.Daily'; break;
    }
    return rtn;
};

export const getHabitFrequencyNames = (): any[] => {
    const rtn = [];

    for (const se in HabitFrequency) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        rtn.push({
          value: +se,
          i18nterm: getHabitFrequencyName(+se),
          displaystring: '',
        });
      }
    }

    return rtn;
};

// Habit complete category
export enum HabitCompleteCategory
{
    NumberOfTimes   = 0,
    NumberOfCount   = 1,
}

export const getHabitCompleteCategoryName = (ctgy: HabitCompleteCategory): string => {
    let rtn = '';
    switch (ctgy) {
        case HabitCompleteCategory.NumberOfCount:    rtn = 'Habit.NumberOfCount';  break;
        case HabitCompleteCategory.NumberOfTimes:    
        default:                                     rtn = 'Habit.NumberOfTimes';   break;
    }
    return rtn;
};

export const getHabitCompleteCategoryNames = (): any[] => {
    const rtn = [];

    for (const se in HabitCompleteCategory) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        rtn.push({
          value: +se,
          i18nterm: getHabitCompleteCategoryName(+se),
          displaystring: '',
        });
      }
    }

    return rtn;
};

// User habit
export class UserHabit
{
    public ID?: number;
    public category: HabitCategory = HabitCategory.Positive;
    public name: string = '';
    public comment: string = '';
    public targetUser: string = '';
    public validFrom: moment.Moment = moment();
    public validTo: moment.Moment = moment();
    public frequency: HabitFrequency = HabitFrequency.Daily;
    public completeCategory: HabitCompleteCategory = HabitCompleteCategory.NumberOfTimes;
    /// <summary>
    /// Complete Condition
    /// 
    /// Depends on the Complete Category & Frequency.
    /// If CompleteCategory is Number Of Times:
    ///     Frequency is Weekly.
    ///         Count of the record per week.
    ///     Frequency is Monthly.
    ///         Count of the record per month.
    ///     Frequency is Daily.
    ///         Not relevant.
    ///     
    /// If CompleteCategory is Number Of Count:
    ///     Frequency is Weekly.
    ///         Sum of record's CompleteFact per week.
    ///     Frequency is Monthly.
    ///         Sum of record's CompleteFact per month.
    ///     Frequency is Daily.
    ///         Sum of record's CompleteFact per day.
    /// 
    /// </summary>
    public completeCondition: number = 1;
    public startDate?: number;

    public arRules: UserHabitRule[] = [];

    get isValid(): boolean {
        if (!this.name) {
            return false;
        }
        if (this.validTo.isSameOrBefore(this.validFrom)) {
            return false;
        }
        switch (this.frequency) {
            case HabitFrequency.Weekly: {
                switch(this.completeCategory) {
                    case HabitCompleteCategory.NumberOfCount: {
                        if (this.startDate === undefined) {
                            return false;
                        }
                        if (this.startDate < 0 || this.startDate > 6) {
                            return false;
                        }
                        if (this.completeCondition < 0) {
                            return false;
                        }
                    }
                    break;

                    case HabitCompleteCategory.NumberOfTimes:
                    default: {
                        if (this.startDate === undefined) {
                            return false;
                        }
                        if (this.startDate < 0 || this.startDate > 6) {
                            return false;
                        }
                        if (this.completeCondition < 0 || this.completeCondition > 7) {
                            return false;
                        }
                    }
                    break;
                }
            }
            break;

            case HabitFrequency.Monthly: {
                switch(this.completeCategory) {
                    case HabitCompleteCategory.NumberOfCount: {
                        if (this.startDate === undefined) {
                            return false;
                        }
                        if (this.startDate < 0 || this.startDate > 27) {
                            return false;
                        }
                        if (this.completeCondition < 0) {
                            return false;
                        }
                    }
                    break;

                    case HabitCompleteCategory.NumberOfTimes:
                    default: {
                        if (this.startDate === undefined) {
                            return false;
                        }
                        if (this.startDate < 0 || this.startDate > 27) {
                            return false;
                        }
                        if (this.completeCondition < 0 || this.completeCategory > 27) {
                            return false;
                        }
                    }
                    break;
                }
            }
            break;

            case HabitFrequency.Daily:
            default: {
                switch(this.completeCategory) {
                    case HabitCompleteCategory.NumberOfCount: {
                        if (this.startDate) {
                            return false;
                        }
                        if (this.completeCondition < 0) {
                            return false;
                        }
                    }
                    break;

                    case HabitCompleteCategory.NumberOfTimes:
                    default: {
                        if (this.startDate) {
                            return false;
                        }
                        if (this.completeCondition !== 1) {
                            return false;
                        }
                    }
                    break;
                }
            }
            break;
        }
        
        return true;
    }
    get validity(): string {
        return `${this.validFrom.format(momentDateFormat)}; ${this.validTo.format(momentDateFormat)}`;
    }

    public parseData(val: any): void {
        if (val && val.ID) {
            this.ID = +val.ID;
        }
        if (val && val.Category) {
            if (isNaN(+val.Category)) {
                this.category = HabitCategory[val.Category as keyof typeof HabitCategory];
            } else {
                this.category = +val.Category;
            }
        }
        if (val && val.Name) {
            this.name = val.Name;
        }
        if (val && val.Comment) {
            this.comment = val.Comment;
        }
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.ValidFrom) {
            this.validFrom = moment(val.ValidFrom);
        }
        if (val && val.ValidTo) {
            this.validTo = moment(val.ValidTo);
        }
        if (val && val.Frequency) {
            if (isNaN(+val.Frequency)) {
                this.frequency = HabitFrequency[val.Frequency as keyof typeof HabitFrequency];
            } else {
                this.frequency = +val.Frequency;
            }
        }
        if (val && val.CompleteCategory) {
            if (isNaN(+val.CompleteCategory)) {
                this.completeCategory = HabitCompleteCategory[val.CompleteCategory as keyof typeof HabitCompleteCategory];
            } else {
                this.completeCategory = +val.CompleteCategory;
            }
        }
        if (val && val.CompleteCondition) {
            this.completeCondition = val.CompleteCondition;
        }
        if (val && val.StartDate) {
            this.startDate = val.StartDate;
        }
        this.arRules = [];
        if (val && val.Rules) {
            const items: any[] = val.Rules as any[];
            items.forEach(tg => {
                const item = new UserHabitRule();
                item.parseData(tg);
                this.arRules.push(item);
            });
        }
    }
    public writeJSONObject(isCreatedMode = true): any {
        const jobj: any =  { };
        if (!isCreatedMode) {
            jobj.ID = this.ID;
        }
        jobj.Category = HabitCategory[this.category];
        jobj.Name = this.name;
        if (this.comment) {
            jobj.Comment = this.comment;
        }
        jobj.TargetUser = this.targetUser;
        jobj.ValidFrom = this.validFrom.format(momentDateFormat);
        jobj.ValidTo = this.validTo.format(momentDateFormat);
        jobj.Frequency = HabitFrequency[this.frequency];
        jobj.CompleteCategory = HabitCompleteCategory[this.completeCategory];
        jobj.CompleteCondition = this.completeCondition;
        if (this.startDate) {
            jobj.StartDate = this.startDate;
        }

        if (this.arRules && this.arRules.length > 0) {
            jobj.Rules = [];
            this.arRules.forEach(it => {
                jobj.Rules.push(it.writeJSONObject(isCreatedMode));
            });
        }

        return jobj;
    }
}

// User habit: rules
export class UserHabitRule
{
    public habitID?: number;
    public ruleID?: number;
    public continuousRecordFrom: number = 1;
    public continuousRecordTo: number = 1;
    public point: number = 1;

    get continuousDays(): string {
        return `[${this.continuousRecordFrom} - ${this.continuousRecordTo})`;
    }
    get isValid(): boolean {
        if (!this.continuousRecordFrom || !this.continuousRecordTo || !this.point) {
            return false;
        }
        if (this.continuousRecordTo <= this.continuousRecordFrom) {
            return false;
        }

        return true;
    }
    public parseData(val: any): void {
        if (val && val.HabitID) {
            this.habitID = val.HabitID;
        }
        if (val && val.RuleID) {
            this.ruleID = val.RuleID;
        }
        if (val && val.ContinuousRecordFrom) {
            this.continuousRecordFrom = val.ContinuousRecordFrom;
        }
        if (val && val.ContinuousRecordTo) {
            this.continuousRecordTo = val.ContinuousRecordTo;
        }
        if (val && val.Point) {
            this.point = val.Point;
        }
    }
    public writeJSONObject(isCreatedMode = true): any {
        const jobj: any =  { };
        if (!isCreatedMode) {
            jobj.HabitID = this.habitID;
            jobj.RuleID = this.ruleID;
        }
        jobj.ContinuousRecordFrom = this.continuousRecordFrom;
        jobj.ContinuousRecordTo = this.continuousRecordTo;
        jobj.Point = this.point;

        return jobj;
    }
}

// User habit: records
export class UserHabitRecord {
    public habitID?: number;
    public recordDate: moment.Moment = moment();
    public subID: number = 1;
    public completeFact?: number;
    public ruleID?: number;
    public continuousCount: number = 0;
    public comment: string = '';
    get recordDateString(): string {
        return this.recordDate.format(momentDateFormat);
    }
    public parseData(val: any): void {
        if (val && val.HabitID) {
            this.habitID = val.HabitID;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.SubID) {
            this.subID = val.SubID;
        }
        if (val && val.CompleteFact) {
            this.completeFact = val.CompleteFact;
        }
        if (val && val.RuleID) {
            this.ruleID = val.RuleID;
        }
        if (val && val.ContinuousCount) {
            this.continuousCount = val.ContinuousCount;
        }
        if (val && val.Comment) {
            this.comment = val.Comment;
        }
    }
    public writeJSONObject(isCreatedMode = true): any {
        const jobj: any =  { };
        jobj.HabitID = this.habitID;
        jobj.RecordDate = this.recordDate.format(momentDateFormat);
        jobj.SubID = this.subID;
        jobj.CompleteFact = this.completeFact;
        if (!isCreatedMode) {
            if (this.ruleID) {
                jobj.RuleID = this.ruleID;
                jobj.ContinuousCount = this.continuousCount;
            }
        }
        if (this.comment) {
            jobj.Comment = this.comment;
        }
        
        return jobj;
    }
}

// User habit: points
export class UserHabitPoint {
    public ID?: number;
    public targetUser: string = '';
    public recordDate: moment.Moment = moment();
    public point: number = 0;
    public comment: string = '';

    get isValid(): boolean {
        if (this.point === 0) {
            return false;
        }

        return true;
    }

    public parseData(val: any): void {
        if (val && val.ID) {
            this.ID = val.ID;
        }
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.Point) {
            this.point = val.Point;
        }
        if (val && val.Comment) {
            this.comment = val.Comment;
        }
    }
    public writeJSONObject(isCreatedMode = true): any {
        const jobj: any =  { };
        if (!isCreatedMode)  {
            jobj.ID = this.ID;
        }
        jobj.TargetUser = this.targetUser;
        jobj.RecordDate = this.recordDate.format(momentDateFormat);
        jobj.Point = this.point;
        if (this.comment) {
            jobj.Comment = this.comment;
        }
        
        return jobj;
    }
}

// User habit points by user and date
export class UserHabitPointsByUserDate {
    public targetUser = '';
    public recordDate: moment.Moment = moment();
    public point: number = 0;
    get recordDateString(): string {
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

// User habit points by user, date and habit
export class UserHabitPointsByUserHabitDate {
    public targetUser = '';
    public habitID: number = 0;
    public recordDate: moment.Moment = moment();
    public point: number = 0;

    get recordDateString(): string {
        return this.recordDate.format(momentDateFormat);
    }
    public parseData(val: any): void {
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.HabitID) {
            this.habitID = val.HabitID;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.Point) {
            this.point = val.Point;
        }
    }    
}

// User Habit record view (more than UserHabitRecord itself): habit name, habit validity
export class UserHabitRecordView {
    public habitID?: number;    
    public recordDate: moment.Moment = moment();
    public subID: number = 1;
    public completeFact?: number;
    public ruleID?: number;
    public continuousCount: number = 0;
    public comment: string = '';
    get recordDateString(): string {
        return this.recordDate.format(momentDateFormat);
    }
    public targetUser: string = '';    
    public habitName: string = '';
    public habitValidFrom: moment.Moment = moment();
    public habitValidTo: moment.Moment = moment();
    get habitValidString(): string {
        return this.habitValidFrom.format(momentDateFormat) + "; " + this.habitValidTo.format(momentDateFormat);
    }
    public parseData(val: any): void {
        if (val && val.HabitID) {
            this.habitID = val.HabitID;
        }
        if (val && val.RecordDate) {
            this.recordDate = moment(val.RecordDate);
        }
        if (val && val.SubID) {
            this.subID = val.SubID;
        }
        if (val && val.CompleteFact) {
            this.completeFact = val.CompleteFact;
        }
        if (val && val.RuleID) {
            this.ruleID = val.RuleID;
        }
        if (val && val.ContinuousCount) {
            this.continuousCount = val.ContinuousCount;
        }
        if (val && val.Comment) {
            this.comment = val.Comment;
        }
        if (val && val.TargetUser) {
            this.targetUser = val.TargetUser;
        }
        if (val && val.HabitName) {
            this.habitName = val.HabitName;
        }
        if (val && val.HabitValidFrom) {
            this.habitValidFrom = moment(val.HabitValidFrom);
        }
        if (val && val.HabitValidTo) {
            this.habitValidTo = moment(val.HabitValidTo);
        }
    }
}

// User Habit Point View
export class UserHabitPointReport extends UserHabitPointsByUserDate {
    // Do nothing
}
