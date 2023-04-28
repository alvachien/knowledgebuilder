//
// Unit test for habit.ts
//
import moment from 'moment';
import { HabitCategory, HabitCompleteCategory, HabitFrequency, UserHabit, UserHabitPoint,
  UserHabitPointsByUserDate, UserHabitPointsByUserHabitDate, UserHabitPointReport, UserHabitRecord,
  UserHabitRule, UserHabitRecordView, } from './habit';

describe('UserHabit', () => {
  let testobj: UserHabit;

  beforeEach(() => {
    testobj = new UserHabit();
  });

  it('is valid', () => {
    expect(testobj.isValid).toBeFalse();

    testobj.name = 'test';
    expect(testobj.isValid).toBeFalse();

    testobj.validTo = moment().add(-1, 'day');
    expect(testobj.isValid).toBeFalse();
    expect(testobj.validity).toBeTruthy();

    testobj.validTo = moment().add(1, 'month');
    testobj.frequency = HabitFrequency.Weekly;
    testobj.completeCategory = HabitCompleteCategory.NumberOfCount;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 7;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 3;
    testobj.completeCondition = -1;
    expect(testobj.isValid).toBeFalse();
    testobj.completeCondition = 20;
    expect(testobj.isValid).toBeTrue();

    testobj.completeCategory = HabitCompleteCategory.NumberOfTimes;
    testobj.startDate = undefined;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 7;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 6;
    testobj.completeCondition = 8;
    expect(testobj.isValid).toBeFalse();
    testobj.completeCondition = 3;
    expect(testobj.isValid).toBeTrue();

    testobj.frequency = HabitFrequency.Monthly;
    testobj.completeCategory = HabitCompleteCategory.NumberOfCount;
    testobj.startDate = undefined;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 28;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 3;
    testobj.completeCondition = -1;
    expect(testobj.isValid).toBeFalse();
    testobj.completeCondition = 20;
    expect(testobj.isValid).toBeTrue();

    testobj.completeCategory = HabitCompleteCategory.NumberOfTimes;
    testobj.startDate = undefined;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 28;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 6;
    testobj.completeCondition = 38;
    expect(testobj.isValid).toBeFalse();
    testobj.completeCondition = 3;
    expect(testobj.isValid).toBeTrue();

    testobj.frequency = HabitFrequency.Daily;
    testobj.completeCategory = HabitCompleteCategory.NumberOfCount;
    testobj.startDate = 3;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 0;
    testobj.completeCondition = -1;
    expect(testobj.isValid).toBeFalse();
    testobj.completeCondition = 11;
    expect(testobj.isValid).toBeTrue();

    testobj.completeCategory = HabitCompleteCategory.NumberOfTimes;
    testobj.startDate = 3;
    expect(testobj.isValid).toBeFalse();
    testobj.startDate = 0;
    testobj.completeCondition = 2;
    expect(testobj.isValid).toBeFalse();
    testobj.completeCondition = 1;
    expect(testobj.isValid).toBeTrue();
  });

  it('get and set data', () => {
    testobj.ID = 1;
    testobj.category = HabitCategory.Positive;
    testobj.comment = 'test';
    testobj.completeCategory = HabitCompleteCategory.NumberOfTimes;
    testobj.completeCondition = 4;
    testobj.frequency = HabitFrequency.Weekly;
    testobj.targetUser = 'tester';
    testobj.startDate = 1; // Monday
    testobj.validFrom = moment('2021-01-01');
    testobj.validTo = moment('2022-01-01');

    const data = testobj.writeJSONObject();
    expect(data).toBeTruthy();

    const testobj2 = new UserHabit();
    testobj2.parseData(data);
    expect(testobj2.comment).toEqual(testobj.comment);
  });
});

describe('UserHabitRule', () => {
  let testobj: UserHabitRule;

  beforeEach(() => {
    testobj = new UserHabitRule();
  });

  it('default value', () => {
    expect(testobj.continuousRecordFrom).toEqual(1);
    expect(testobj.continuousRecordTo).toEqual(1);
    expect(testobj.point).toEqual(1);
    expect(testobj.continuousCompletedCounts).toBeTruthy();    
  });

  it('is valid', () => {
    expect(testobj.isValid).toBeFalse();
    testobj.continuousRecordTo = 3;
    expect(testobj.isValid).toBeTrue();
    testobj.point = 0;
    expect(testobj.isValid).toBeFalse();
  });

  it('parse and write', () => {
    let ojson = testobj.writeJSONObject(false);
    testobj.parseData(ojson);
    expect(testobj.point).toEqual(1);
  });
});

describe('UserHabitPoint', () => {
  let testobj: UserHabitPoint;

  beforeEach(() => {
    testobj = new UserHabitPoint();
  });

  it('isValid is false', () => {
    expect(testobj.isValid).toBeFalse();
  });

  it('isValid is true', () => {
    testobj.point = 20;
    expect(testobj.isValid).toBeTrue();
  });

  it('writeJSONObject with create mode', () => {
    testobj.ID = 122;
    testobj.targetUser = 'test';
    // testobj.recordDate = moment();
    testobj.point = 30;
    testobj.comment = 'test2';
    let jstring = testobj.writeJSONObject(true);
    expect(jstring).toBeTruthy();
  });

  it('parseData', () => {
    let objdata = {
      ID: 122,
      TargetUser: 'Test',
      RecordDate: '2022-12-12',
      Point: 30,
      Comment: 'test'
    };

    testobj.parseData(objdata);
    expect(testobj.comment).toEqual(objdata.Comment);
    expect(testobj.point).toEqual(objdata.Point);
    expect(testobj.targetUser).toEqual(objdata.TargetUser);
  });
});

describe('UserHabitRecord', () => {
  let testobj: UserHabitRecord;

  beforeEach(() => {
    testobj = new UserHabitRecord();
  });

  it('default value', () => {
    expect(testobj.subID).toEqual(1);
    expect(testobj.continuousCount).toEqual(0);
    expect(testobj.comment).toEqual('');
    expect(testobj.recordDateString).toBeTruthy();
  });

  it('parse data', () => {
    let objdata = {
      HabitID: 23,
      RecordDate: '2022-02-03',
      SubID: 2,
      CompleteFact: 3,
      RuleID: 4,
      ContinuousCount: 5,
      Comment: 'test',  
    };
    testobj.parseData(objdata);
    expect(testobj.comment).toEqual(objdata.Comment);
    expect(testobj.habitID).toEqual(objdata.HabitID);
    expect(testobj.subID).toEqual(objdata.SubID);
    expect(testobj.completeFact).toEqual(objdata.CompleteFact);
    expect(testobj.ruleID).toEqual(objdata.RuleID);
    expect(testobj.continuousCount).toEqual(objdata.ContinuousCount);    
  });

  it('write json string with create mode', () => {
    testobj.habitID = 23;
    testobj.subID = 2;
    testobj.completeFact = 3;
    testobj.ruleID = 4;
    testobj.continuousCount = 5;
    testobj.comment = 'tewst';
    let objdata = testobj.writeJSONObject(true);
    expect(objdata.RuleID).toBeUndefined();
    expect(objdata.ContinuousCount).toBeUndefined();
    expect(objdata.Comment).toEqual(testobj.comment);
  });

  it('write json string with non-create mode', () => {
    testobj.habitID = 23;
    testobj.subID = 2;
    testobj.completeFact = 3;
    testobj.ruleID = 4;
    testobj.continuousCount = 5;
    testobj.comment = 'tewst';
    let objdata = testobj.writeJSONObject(false);
    expect(objdata.RuleID).not.toBeUndefined();
    expect(objdata.ContinuousCount).not.toBeUndefined();
    expect(objdata.Comment).toEqual(testobj.comment);
  });
});

describe('UserHabitPointsByUserDate', () => {
  let testobj: UserHabitPointsByUserDate;

  beforeEach(() => {
    testobj = new UserHabitPointsByUserDate();
  });

  it('default value', () => {
    expect(testobj.targetUser).toEqual('');
    expect(testobj.point).toEqual(0);
    expect(testobj.recordDateString).toBeTruthy();
  });

  it('parse data', () => {
    let objdata = {
      TargetUser: 'test',
      RecordDate: '2022-02-01',
      Point: 30
    };

    testobj.parseData(objdata);

    expect(testobj.targetUser).toEqual(objdata.TargetUser);
    expect(testobj.point).toEqual(objdata.Point);
    expect(testobj.recordDateString).toBeTruthy();
  });
});

describe('UserHabitPointsByUserHabitDate', () => {
  let testobj: UserHabitPointsByUserHabitDate;

  beforeEach(() => {
    testobj = new UserHabitPointsByUserHabitDate();
  });

  it('default value', () => {
    expect(testobj.targetUser).toEqual('');
    expect(testobj.point).toEqual(0);
    expect(testobj.recordDateString).toBeTruthy();
    expect(testobj.habitID).toEqual(0);
  });

  it('parse data', () => {
    let objdata = {
      TargetUser: 'test',
      RecordDate: '2022-02-01',
      Point: 30,
      HabitID: 11,
    };

    testobj.parseData(objdata);

    expect(testobj.targetUser).toEqual(objdata.TargetUser);
    expect(testobj.point).toEqual(objdata.Point);
    expect(testobj.recordDateString).toBeTruthy();
    expect(testobj.habitID).toEqual(objdata.HabitID);
  });
});

describe('UserHabitPointReport', () => {
  let testobj: UserHabitPointReport;

  beforeEach(() => {
    testobj = new UserHabitPointReport();
  });

  it('default value', () => {
    expect(testobj.targetUser).toEqual('');
    expect(testobj.point).toEqual(0);
    expect(testobj.recordDateString).toBeTruthy();
  });

  it('parse data', () => {
    let objdata = {
      TargetUser: 'test',
      RecordDate: '2022-02-01',
      Point: 30
    };

    testobj.parseData(objdata);

    expect(testobj.targetUser).toEqual(objdata.TargetUser);
    expect(testobj.point).toEqual(objdata.Point);
    expect(testobj.recordDateString).toBeTruthy();
  });
});

describe('UserHabitRecordView', () => {
  let objtc: UserHabitRecordView;

  beforeEach(() => {
    objtc = new UserHabitRecordView();    
  })

  it('parse data', () => {
    expect(objtc.recordDateString).toBeTruthy();
    expect(objtc.habitValidString).toBeTruthy();

    objtc.parseData({
      HabitID: 12,
      RecordDate: '2022-02-03',
      SubID: 23,
      CompleteFact: 2,
      RuleID: 12,
      ContinuousCount: 7,
      Comment: 'test',
      TargetUser: 'test',
      HabitName: 'test',
      HabitValidFrom: '2022-02-04',
      HabitValidTo: '2023-02-04',
      RuleDaysFrom: 2,
      RuleDaysTo: 4,
      RulePoint: 20  
    });
    expect(objtc).toBeTruthy();
  });
});
