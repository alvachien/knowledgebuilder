//
// Models for Habit
//

import moment from 'moment';

export enum HabitCategory
{
    Positive = 0,
    Negative = 1,
}

export enum HabitFrequency
{
    Daily       = 0,
    Weekly      = 1,
    Monthly     = 2
}

export enum HabitCompleteCategory
{
    NumberOfTimes   = 0,
    NumberOfCount   = 1,
}

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

    public rulesLit: UserHabitRule[] = [];

    public parseData(val: any): void {
        if (val && val.ID) {
            this.ID = +val.ID;
        }
    }
    public writeJSONObject(): any {
        const jobj: any =  { };
        return jobj;
    }
}

export class UserHabitRule
{
    public habitID?: number;
    public ruleID?: number;
    public continuousRecordFrom: number = 1;
    public continuousRecordTo: number = 1;
    public point: number = 1;
    public parseData(val: any): void {
    }
    public writeJSONObject(): any {
        const jobj: any =  { };
        return jobj;
    }
}

export class UserHabitRecord
{
    public habitID?: number;    
    public recordDate: moment.Moment = moment();
    public subID: number = 1;
    public completeFact?: number;
    public ruleID?: number;
    public continousCount: number = 0;
    public comment: string = '';
    public parseData(val: any): void {
    }
    public writeJSONObject(): any {
        const jobj: any =  { };
        return jobj;
    }
}
