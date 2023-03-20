//
// Unit test for habit.ts
//
import moment from 'moment';
import { HabitCategory, HabitCompleteCategory, HabitFrequency } from '.';
import { UserHabit, UserHabitRule, UserHabitRecord } from './habit';

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
