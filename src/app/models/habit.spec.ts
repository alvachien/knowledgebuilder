//
// Unit test for habit.ts
//
import moment from 'moment';
import { HabitCategory, HabitCompleteCategory, HabitFrequency } from '.';
import { UserHabit, UserHabitPoint } from './habit';

describe('UserHabit', () => {
  let testobj: UserHabit;

  beforeEach(() => {
    testobj = new UserHabit();
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
