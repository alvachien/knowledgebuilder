import { ExerciseItemType, getExerciseItemTypeName, getExerciseItemTypeNames,
  ExerciseItem, ExerciseItemSearchResult, ExerciseItemUserScore } from './exercise-item';

describe('getExerciseItemTypeName', () => {
  it('Go through all enu', () => {
    const types = Object.values(ExerciseItemType);
    types.forEach((typeval) => {
      const typename = getExerciseItemTypeName(typeval as ExerciseItemType);
      expect(typename).toBeTruthy();
    });
  });
});

describe('getExerciseItemTypeNames', () => {
  it('Fetch all strings', () => {
    const arnames = getExerciseItemTypeNames();
    for (const name of arnames) {
      // expect(name.value).toBeTruthy(); //value could be 0!
      expect(name.i18nterm).toBeTruthy();
      expect(name.displaystring).toEqual('');
    }
  });
});

describe('ExerciseItem', () => {
  it('get and set data', () => {
    const item = new ExerciseItem();
    item.Answer = 'test';
    item.Content = 'test';
    item.ItemType = ExerciseItemType.EssayQuestions;

    const wrtobj = item.generateString();
    expect(wrtobj).toBeTruthy();
  });
});

describe('ExerciseItemSearchResult', () => {
  let testobj: ExerciseItemSearchResult;

  beforeEach(() => {
    testobj = new ExerciseItemSearchResult();
  });

  it('default value', () => {
    expect(testobj.Content).toEqual('');
  });
});

describe('ExerciseItemUserScore', () => {
  let testobj: ExerciseItemUserScore;

  beforeEach(() => {
    testobj = new ExerciseItemUserScore();
  });

  it('default value', () => {
    expect(testobj.Score).toEqual(0);
  });
});
