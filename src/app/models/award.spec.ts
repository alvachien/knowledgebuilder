//
// Unit test for award.ts
//

import { AwardRuleTypeEnum, DailyTrace } from '.';
import { getAwardRuleTypeName, getAwardRuleTypeNames, AwardRuleGroup, AwardRuleDetail,
  AwardRule, AwardPoint, AwardPointReport, } from './award';

describe('getAwardRuleTypeName', () => {
  it('Go through all enu', () => {
    const types = Object.values(AwardRuleTypeEnum);
    types.forEach((typeval) => {
      if (typeof typeval == 'number') {
        const typename = getAwardRuleTypeName(typeval as AwardRuleTypeEnum);
        expect(typename).toBeTruthy();
      }
    });
  });
});

describe('getAwardRuleTypeNames', () => {
  it('Fetch all strings', () => {
    const arnames = getAwardRuleTypeNames();
    for (const name of arnames) {
      // expect(name.value).toBeTruthy();
      expect(name.i18nterm).toBeTruthy();
      expect(name.displaystring).toEqual('');
    }
  });
});

describe('AwardRuleGroup', () => {
  let testobj: AwardRuleGroup;

  beforeEach(() => {
    testobj = new AwardRuleGroup();
  });

  it('check validility', () => {
    // Nothing input
    let isvalid = testobj.isValid();
    expect(isvalid).toBeFalse();

    // With target user, no desp
    testobj.targetUser = 'test';
    isvalid = testobj.isValid();
    expect(isvalid).toBeFalse();

    testobj.desp = 'test';
    isvalid = testobj.isValid();
    expect(isvalid).toBeTrue();
  });

  it('parse and set data', () => {
    testobj.targetUser = 'test';
    testobj.desp = 'test';

    const ardata = testobj.writeJSONObject();
    expect(ardata).toBeTruthy();
    const ardatastr = testobj.writeJSONString();
    expect(ardatastr).toBeTruthy();
    const testobj2 = new AwardRuleGroup();
    testobj2.parseData(ardata);
    expect(testobj2).toBeTruthy();
  });
});

describe('AwardRuleDetail', () => {
  let testobj: AwardRuleDetail;

  beforeEach(() => {
    testobj = new AwardRuleDetail();
  });

  it('default value', () => {
    expect(testobj.id).toEqual(-1);
    expect(testobj.groupID).toEqual(-1);
    expect(testobj.point).toEqual(0);
  });

  it('parse data', () => {
    let objdata = {
      GroupID: 1,
      ID: 2,
      CountOfFactLow: 3,
      CountOfFactHigh: 4,
      DoneOfFact: true,
      TimeStart: 6,
      TimeEnd: 7,
      DaysFrom: 8,
      DaysTo: 9,
      Point: 10
    };
    testobj.parseData(objdata);
    expect(testobj.point).toEqual(objdata.Point);
    expect(testobj.countString).toBeTruthy();
    expect(testobj.doneString).toBeTruthy();
    expect(testobj.timeString).toBeTruthy();

    let objdata2 = testobj.writeJSONObject(false);
    expect(objdata2).toBeTruthy();

    let isvalid = testobj.isValid(AwardRuleTypeEnum.BodyExerciseCount);
    expect(isvalid).toBeTrue();
  });
});

describe('AwardRule', () => {
  let testobj: AwardRule;

  beforeEach(() => {
    testobj = new AwardRule();
  });

  it('default value', () => {
    expect(testobj.id).toEqual(-1);
    expect(testobj.desp).toEqual('');

    let tobj2: AwardRule = new AwardRule();
    tobj2.copyFrom(testobj);
    expect(tobj2).toBeTruthy();
  });
});

describe('DailyTrace', () => {
  let testobj: DailyTrace;

  beforeEach(() => {
    testobj = new DailyTrace();
  });

  it('default value', () => {
    expect(testobj.targetUser).toEqual('');
    expect(testobj.getRecordDateDisplayString()).toBeTruthy();
    let ivld = testobj.isValid();
    expect(ivld).toBeFalse();
  });

  it('parse data', () => {
    testobj.parseData({
      TargetUser: 'test',
      RecordDate: '2022-01-02',
      GoToBedTime: 9,
      SchoolWorkTime: 3,
      HomeWorkCount: 20,
      BodyExerciseCount: 10,
      ErrorsCollection: 2,
      HandWriting: true,
      CleanDesk: true,
      HouseKeepingCount: 3,
      PoliteBehavior: 4,
      Comment: 'test'
    });
    expect(testobj.homeWorkCount).toEqual(20);

    let objstr = testobj.writeJSONString();
    expect(objstr).toBeTruthy();
  });
});

describe('AwardPoint', () => {
  let testobj: AwardPoint;

  beforeEach(() => {
    testobj = new AwardPoint();
  });

  it('default value', () => {
    expect(testobj.comment).toEqual('');
    expect(testobj.getRecordDateDisplayString()).toBeTruthy();
  });

  it('check valid', () => {
    let isvalid = testobj.isValid();
    expect(isvalid).toBeFalse();

    testobj.targetUser = 'aaa';
    isvalid = testobj.isValid();
    expect(isvalid).toBeFalse();

    testobj.point = 10;
    isvalid = testobj.isValid();
    expect(isvalid).toBeTrue();
  });

  it('parse data', () => {
    testobj.parseData({
      ID: 12,
      TargetUser: 'aaa',
      RecordDate: '2022-01-03',
      MatchedRuleID: 12,
      CountOfDay: 3,
      Point: 10,
      Comment: 'test'
    });
    expect(testobj.countOfDay).toEqual(3);
    expect(testobj.point).toEqual(10);

    let objstr = testobj.writeJSONString();
    expect(objstr).toBeTruthy();
  });
});

describe('AwardPointReport', () => {
  let objtc: AwardPointReport;

  beforeEach(() => {
    objtc = new AwardPointReport();
  });

  it('default value', () => {
    expect(objtc.aggPoint).toEqual(0);
    expect(objtc.getRecordDateDisplayString()).toBeTruthy();
  });

  it('parse data', () => {
    objtc.parseData({
      TargetUser: 'aaa',
      RecordDate: '2022-01-04',
      Point: 10,
      AggPoint: 12,
    });

    expect(objtc.point).toEqual(10);
    expect(objtc.aggPoint).toEqual(12);
  });
});
