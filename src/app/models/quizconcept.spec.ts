import {
  QuizSection,
  Quiz,
  AdditionQuizItem,
  SubtractionQuizItem,
  MultiplicationQuizItem,
  DivisionQuizItem,
} from './quizconcept';

describe('QuizSection', () => {
  let objtbt: QuizSection;

  beforeEach(() => {
    objtbt = new QuizSection(1, 2);
  });

  it('basic', () => {
    expect(objtbt.SectionID).toEqual(1);
    expect(objtbt.ItemsCount).toEqual(2);
    expect(objtbt.FailedItemsCount).toEqual(0);
  });

  it('case1', () => {
    expect(objtbt.IsStarted).toBeFalse();

    objtbt.Start();
    expect(objtbt.IsStarted).toBeTrue();

    objtbt.Complete(1);
    expect(objtbt.IsStarted).toBeFalse();
    expect(objtbt.FailedItemsCount).toEqual(1);
    // It is too fast
    // expect(objtbt.TimeSpent).toBeDefined();
  });
});

describe('Quiz', () => {
  let objtbt: Quiz;

  beforeEach(() => {
    objtbt = new Quiz(1);
  });

  it('basic', () => {
    expect(objtbt.QuizID).toEqual(1);
  });
});

describe('AdditionQuizItem', () => {
  let objtbt: AdditionQuizItem;

  beforeEach(() => {
    objtbt = new AdditionQuizItem(3, 2);
  });

  it('incorrect input', () => {
    expect(objtbt.Result).toEqual(5);

    objtbt.InputtedResult = 4;
    expect(objtbt.InputtedResult).toEqual(4);
    expect(objtbt.IsCorrect()).toBeFalse();

    let formula = objtbt.getCorrectFormula();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
  });

  it('correct input', () => {
    expect(objtbt.Result).toEqual(5);

    objtbt.InputtedResult = 5;
    expect(objtbt.InputtedResult).toEqual(5);
    expect(objtbt.IsCorrect()).toBeTrue();
  });
});

describe('SubtractionQuizItem', () => {
  let objtbt: SubtractionQuizItem;

  beforeEach(() => {
    objtbt = new SubtractionQuizItem(3, 2);
  });

  it('incorrect input', () => {
    expect(objtbt.Result).toEqual(1);

    objtbt.InputtedResult = 4;
    expect(objtbt.InputtedResult).toEqual(4);
    expect(objtbt.IsCorrect()).toBeFalse();

    let formula = objtbt.getCorrectFormula();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
  });
  it('correct input', () => {
    expect(objtbt.Result).toEqual(1);

    objtbt.InputtedResult = 1;
    expect(objtbt.InputtedResult).toEqual(1);
    expect(objtbt.IsCorrect()).toBeTrue();
  });
});

describe('MultiplicationQuizItem', () => {
  let objtbt: MultiplicationQuizItem;

  beforeEach(() => {
    objtbt = new MultiplicationQuizItem(3, 2);
  });

  it('incorrect input', () => {
    expect(objtbt.Result).toEqual(6);

    objtbt.InputtedResult = 4;
    expect(objtbt.InputtedResult).toEqual(4);
    expect(objtbt.IsCorrect()).toBeFalse();

    let formula = objtbt.getCorrectFormula();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
  });
  it('correct input', () => {
    expect(objtbt.Result).toEqual(6);

    objtbt.InputtedResult = 6;
    expect(objtbt.InputtedResult).toEqual(6);
    expect(objtbt.IsCorrect()).toBeTrue();
  });
});

describe('DivisionQuizItem', () => {
  let objtbt: DivisionQuizItem;

  beforeEach(() => {
    objtbt = new DivisionQuizItem(6, 2);
  });

  it('incorrect input', () => {
    expect(objtbt.Quotient).toEqual(3);
    expect(objtbt.Remainder).toEqual(0);

    objtbt.InputtedQuotient = 4;
    expect(objtbt.InputtedQuotient).toEqual(4);
    objtbt.InputtedRemainder = 2;
    expect(objtbt.InputtedRemainder).toEqual(2);
    expect(objtbt.IsCorrect()).toBeFalse();

    let formula = objtbt.getCorrectFormula();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
    formula = objtbt.getQuizFormat();
    expect(formula).toBeTruthy();
  });
  it('correct input', () => {
    expect(objtbt.Quotient).toEqual(3);
    expect(objtbt.Remainder).toEqual(0);

    objtbt.InputtedQuotient = 3;
    expect(objtbt.InputtedQuotient).toEqual(3);
    objtbt.InputtedRemainder = 0;
    expect(objtbt.InputtedRemainder).toEqual(0);
    expect(objtbt.IsCorrect()).toBeTrue();
  });
});
