import { OverviewInfo } from './overview-info';
import { TagReferenceType } from './tag';

describe('ExerciseItemAnswer', () => {
  let objtbt: OverviewInfo;

  beforeEach(() => {
    objtbt = new OverviewInfo();
  });

  it('basic assignment', () => {
    objtbt.RefType = TagReferenceType.ExerciseItem;
    objtbt.Count = 2;

    expect(objtbt.RefType).toEqual(TagReferenceType.ExerciseItem);
  });

  it('parseData', () => {
    objtbt.parseData({
      RefType: 'ExerciseItem',
      Count: 2,
    });
    expect(objtbt.RefType).toEqual(TagReferenceType.ExerciseItem);
    expect(objtbt.Count).toEqual(2);
  });
});
