//
// Unit test for award.ts
//

import { AwardRuleTypeEnum } from '.';
import {
  getAwardRuleTypeName,
  getAwardRuleTypeNames,
  AwardRuleGroup,
} from './award';

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
