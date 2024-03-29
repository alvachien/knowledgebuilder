/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */

import moment from 'moment';
import { SafeAny } from '../common';
import { momentDateFormat } from './uicommon';

/**
 * Award Rule
 */
export enum AwardRuleTypeEnum {
  GoToBedTime = 1, // TIME
  SchoolWorkTime = 2, // TIME
  HomeWorkCount = 3, // COUNT
  BodyExerciseCount = 4, // COUNT
  ErrorCollectionHabit = 5, // YES or NO
  CleanDeakHabit = 6, // YES or NO
  HouseKeepingCount = 7, // COUNT
  PoliteBehavior = 8, // COUNT
  HandWritingHabit = 9, // YES or NO
}

export const getAwardRuleTypeName = (ruletype: AwardRuleTypeEnum): string => {
  let rtn = '';
  switch (ruletype) {
    case AwardRuleTypeEnum.GoToBedTime:
      rtn = 'Award.GoToBedTime';
      break;

    case AwardRuleTypeEnum.SchoolWorkTime:
      rtn = 'Award.SchoolWorkTime';
      break;

    case AwardRuleTypeEnum.HomeWorkCount:
      rtn = 'Award.HomeworkCount';
      break;

    case AwardRuleTypeEnum.BodyExerciseCount:
      rtn = 'Award.BodyExerciseCount';
      break;

    case AwardRuleTypeEnum.ErrorCollectionHabit:
      rtn = 'Award.ErrorsCollection';
      break;
    case AwardRuleTypeEnum.CleanDeakHabit:
      rtn = 'Award.CleanDesk';
      break;
    case AwardRuleTypeEnum.HouseKeepingCount:
      rtn = 'Award.HouseKeepingCount';
      break;
    case AwardRuleTypeEnum.PoliteBehavior:
      rtn = 'Award.PoliteBehavior';
      break;
    case AwardRuleTypeEnum.HandWritingHabit:
      rtn = 'Award.HandWriting';
      break;
    default:
      rtn = '';
      break;
  }
  return rtn;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAwardRuleTypeNames = (): any[] => {
  const rtn = [];

  for (const se in AwardRuleTypeEnum) {
    if (Number.isNaN(+se)) {
      // Do nothing
    } else {
      rtn.push({
        value: +se,
        i18nterm: getAwardRuleTypeName(+se),
        displaystring: '',
      });
    }
  }

  return rtn;
};

export class AwardRuleGroup {
  id = -1;
  ruleType: AwardRuleTypeEnum = AwardRuleTypeEnum.GoToBedTime;
  targetUser = '';
  desp = '';
  validFrom: moment.Moment = moment();
  validTo: moment.Moment = moment();
  rules: AwardRuleDetail[] = [];

  public isValid(): boolean {
    if (!this.targetUser) {
      return false;
    }
    if (!this.desp) {
      return false;
    }

    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    this.rules = [];
    if (val && val.Rules) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] = val.Rules as any[];
      items.forEach((tg) => {
        const item = new AwardRuleDetail();
        item.parseData(tg);
        this.rules.push(item);
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeJSONObject(isCreatedMode = true): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobj: any = {};
    if (!isCreatedMode) {
      jobj.ID = this.id;
    }
    (jobj.RuleType = AwardRuleTypeEnum[this.ruleType]), (jobj.TargetUser = this.targetUser);
    jobj.Desp = this.desp;
    jobj.ValidFrom = this.validFrom.format(momentDateFormat);
    jobj.ValidTo = this.validTo.format(momentDateFormat);
    if (this.rules && this.rules.length > 0) {
      jobj.Rules = [];
      this.rules.forEach((it) => {
        jobj.Rules.push(it.writeJSONObject(isCreatedMode));
      });
    }

    return jobj;
  }
  public writeJSONString(isCreatedMode = true): string {
    return JSON && JSON.stringify(this.writeJSONObject(isCreatedMode));
  }
}

export class AwardRuleDetail {
  id = -1;
  groupID = -1;
  countOfFactLow?: number;
  countOfFactHigh?: number;
  doneOfFact?: boolean;
  timeStart?: number;
  timeEnd?: number;
  daysFrom?: number;
  daysTo?: number;
  point = 0;

  get countString(): string {
    return `${this.countOfFactLow} - ${this.countOfFactHigh}`;
  }
  get doneString(): string {
    return `${this.doneOfFact}`;
  }
  get timeString(): string {
    return `${this.timeStart} - ${this.timeEnd}`;
  }
  get dayString(): string {
    return `${this.daysFrom} - ${this.daysTo}`;
  }

  public isValid(ruleType: AwardRuleTypeEnum): boolean {
    switch (ruleType) {
      case AwardRuleTypeEnum.GoToBedTime:
      case AwardRuleTypeEnum.SchoolWorkTime:
        {
          if (this.timeStart === undefined || this.timeEnd === undefined || this.timeStart > this.timeEnd) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(val: any): void {
    if (val && val.ID) {
      this.id = +val.ID;
    }
    if (val && val.GroupID) {
      this.groupID = +val.GroupID;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeJSONObject(isCreatedMode = true): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobj: any = {};
    if (!isCreatedMode) {
      jobj.ID = this.id;
      jobj.GroupID = this.groupID;
    }
    if (this.countOfFactLow !== undefined && this.countOfFactLow !== null) {
      jobj.CountOfFactLow = this.countOfFactLow;
    }
    if (this.countOfFactHigh !== undefined && this.countOfFactHigh !== null) {
      jobj.CountOfFactHigh = this.countOfFactHigh;
    }
    if (this.doneOfFact !== undefined && this.doneOfFact !== null) {
      jobj.DoneOfFact = this.doneOfFact;
    }
    if (this.timeStart !== undefined && this.timeStart !== null) {
      jobj.TimeStart = this.timeStart;
    }
    if (this.timeEnd !== undefined && this.timeEnd !== null) {
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

  public copyFrom(oldrule: AwardRule) {
    this.ruleType = oldrule.ruleType;
    this.targetUser = oldrule.targetUser;
    this.desp = oldrule.desp;
    this.validFrom = moment(oldrule.validFrom.format(momentDateFormat));
    this.validTo = moment(oldrule.validTo.format(momentDateFormat));
    this.countOfFactLow = oldrule.countOfFactLow;
    this.countOfFactHigh = oldrule.countOfFactHigh;
    this.doneOfFact = oldrule.doneOfFact;
    this.timeStart = oldrule.timeStart;
    this.timeEnd = oldrule.timeEnd;
    this.daysFrom = oldrule.daysFrom;
    this.daysTo = oldrule.daysTo;
    this.point = oldrule.point;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public parseData(val: SafeAny): void {
    // TBD.
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeJSONObject(isCreatedMode = true): SafeAny {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobj: any = {};
    if (isCreatedMode) {
      // TBD.
    }
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
    if (
      this.schoolWorkTime === null &&
      this.goToBedTime === null &&
      this.homeWorkCount === null &&
      this.bodyExerciseCount === null &&
      this.errorsCollection === null &&
      this.handWriting === null &&
      this.cleanDesk === null &&
      this.houseKeepingCount === null &&
      this.politeBehavior === null
    ) {
      return false;
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(val: any): void {
    if (val && val.TargetUser) {
      this.targetUser = val.TargetUser;
    }
    if (val && val.RecordDate) {
      this.recordDate = moment(val.RecordDate);
    }
    if (val && val.GoToBedTime !== undefined && val.GoToBedTime !== null) {
      this.goToBedTime = val.GoToBedTime;
    }
    if (val && val.SchoolWorkTime !== undefined && val.SchoolWorkTime !== null) {
      this.schoolWorkTime = val.SchoolWorkTime;
    }
    if (val && val.HomeWorkCount !== undefined && val.HomeWorkCount !== null) {
      this.homeWorkCount = val.HomeWorkCount;
    }
    if (val && val.BodyExerciseCount !== undefined && val.BodyExerciseCount !== null) {
      this.bodyExerciseCount = val.BodyExerciseCount;
    }
    if (val && val.ErrorsCollection !== undefined && val.ErrorsCollection !== null) {
      this.errorsCollection = val.ErrorsCollection;
    }
    if (val && val.HandWriting !== undefined && val.HandWriting !== null) {
      this.handWriting = val.HandWriting;
    }
    if (val && val.CleanDesk !== undefined && val.CleanDesk !== null) {
      this.cleanDesk = val.CleanDesk;
    }
    if (val && val.HouseKeepingCount !== undefined && val.HouseKeepingCount !== null) {
      this.houseKeepingCount = +val.HouseKeepingCount;
    }
    if (val && val.PoliteBehavior !== undefined && val.PoliteBehavior !== null) {
      this.politeBehavior = val.PoliteBehavior;
    }
    if (val && val.Comment) {
      this.comment = val.Comment;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeJSONObject(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobj: any = {};
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
  public isValid(): boolean {
    if (!this.targetUser) {
      return false;
    }
    if (this.point === 0) {
      return false;
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeJSONObject(createdMode = true): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobj: any = {};
    if (!createdMode) {
      jobj.ID = this.id;
    }
    jobj.TargetUser = this.targetUser;
    jobj.RecordDate = this.recordDate.format(momentDateFormat);
    jobj.Point = this.point;
    jobj.Comment = this.comment;

    return jobj;
  }
  public writeJSONString(createdMode = true): string {
    return JSON && JSON.stringify(this.writeJSONObject(createdMode));
  }
}

export class AwardPointReport {
  targetUser = '';
  recordDate: moment.Moment = moment();
  point = 0;
  aggPoint = 0;

  public getRecordDateDisplayString(): string {
    return this.recordDate.format(momentDateFormat);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(val: any): void {
    if (val && val.TargetUser) {
      this.targetUser = val.TargetUser;
    }
    if (val && val.RecordDate) {
      this.recordDate = moment(val.RecordDate);
    }
    if (val && val.Point) {
      this.point = +val.Point;
    }
    if (val && val.AggPoint) {
      this.aggPoint = +val.AggPoint;
    }
  }
}

export class AwardUser {
  public targetUser = '';
  public supervisor = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(val: any): void {
    if (val && val.TargetUser) {
      this.targetUser = val.TargetUser;
    }
    if (val && val.Supervisor) {
      this.supervisor = val.Supervisor;
    }
  }
}

export class AwardUserView extends AwardUser {
  public userName = '';
  public displayAs = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override parseData(val: any): void {
    super.parseData(val);
    if (val && val.UserName) {
      this.userName = val.UserName;
    }
    if (val && val.DisplayAs) {
      this.displayAs = val.DisplayAs;
    }
  }
}
