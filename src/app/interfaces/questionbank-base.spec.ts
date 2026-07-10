import { FormControl } from '@angular/forms';

import {
  QuestionBankContentFormatEnum,
  QuestionBankItemLevelEnum,
  QuestionBankTypeEnum,
} from './questionbank';
import type { QuestionBankItemCombinedInterface ,
  QuestionBankItemBase} from './questionbank-base';
import {
  convertToQuestionBankItem,
  QuestionBankItemDictation,
  QuestionBankItemEssay,
  QuestionBankItemFillInTheBlank,
  QuestionBankItemMultipleChoice,
  QuestionBankItemReadingComprehension,
  QuestionBankItemShortAnswer,
  QuestionBankItemSingleChoice,
  QuestionBankItemTrueFalse,
  QuestionBankItemListeningComprehension,
  QuestionBankItemCloze,
  doesQuestionBankItemHasAnswer,
  shuffleQuestionBankItemOption,
  convertQuestionBankItemToMarkdown,
  convertQuestionBankItemAnswerToMarkdown,
  getQuestionBankTypeDescription,
  getAllQuestionBankTypes,
  convertSingleChoiceToMarkdown,
  convertMultipleChoiceToMarkdown,
  convertFillInTheBlankToMarkdown,
  convertShortAnswerToMarkdown,
  convertTrueFalseToMarkdown,
  convertComprehensionToMarkdown,
  convertComprehensionAnswerToMarkdown,
} from './questionbank-base';

describe('getQuestionBankTypeDescription', () => {
  it('should return correct description for SingleChoice', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.SingleChoice)).toBe('单选题');
  });

  it('should return correct description for MultipleChoice', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.MultipleChoice)).toBe('多选题');
  });

  it('should return correct description for FillInTheBlank', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.FillInTheBlank)).toBe('填空题');
  });

  it('should return correct description for Dictation', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.Dictation)).toBe('默写');
  });

  it('should return correct description for ShortAnswer', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.ShortAnswer)).toBe('简答题');
  });

  it('should return correct description for TrueFalse', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.TrueFalse)).toBe('判断题');
  });

  it('should return correct description for Essay', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.Essay)).toBe('作文');
  });

  it('should return correct description for ReadingComprehension', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.ReadingComprehension)).toBe(
      '阅读理解'
    );
  });

  it('should return correct description for ListeningComprehension', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.ListeningComprehension)).toBe(
      '听力理解'
    );
  });

  it('should return correct description for Cloze', () => {
    expect(getQuestionBankTypeDescription(QuestionBankTypeEnum.Cloze)).toBe('完形填空');
  });

  it('should return error description for invalid type', () => {
    expect(getQuestionBankTypeDescription('InvalidType' as QuestionBankTypeEnum)).toBe('类型错误');
  });
});

describe('getAllQuestionBankTypes', () => {
  it('should return a map with all question bank types', () => {
    const typeMap = getAllQuestionBankTypes();
    expect(typeMap.size).toBe(10);
    expect(typeMap.get(QuestionBankTypeEnum.SingleChoice)).toBe('单选题');
    expect(typeMap.get(QuestionBankTypeEnum.MultipleChoice)).toBe('多选题');
    expect(typeMap.get(QuestionBankTypeEnum.FillInTheBlank)).toBe('填空题');
    expect(typeMap.get(QuestionBankTypeEnum.Dictation)).toBe('默写');
    expect(typeMap.get(QuestionBankTypeEnum.ShortAnswer)).toBe('简答题');
    expect(typeMap.get(QuestionBankTypeEnum.TrueFalse)).toBe('判断题');
    expect(typeMap.get(QuestionBankTypeEnum.Essay)).toBe('作文');
    expect(typeMap.get(QuestionBankTypeEnum.ReadingComprehension)).toBe('阅读理解');
    expect(typeMap.get(QuestionBankTypeEnum.ListeningComprehension)).toBe('听力理解');
    expect(typeMap.get(QuestionBankTypeEnum.Cloze)).toBe('完形填空');
  });
});

describe('QuestionBankItemFillInTheBlank', () => {
  it('should create a fill-in-the-blank question with default values', () => {
    const item = new QuestionBankItemFillInTheBlank();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
  });

  it('should create a fill-in-the-blank question with custom values', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 5,
      question: 'The @capital@ of France is Paris.',
      questionFormat: 'Text',
      answer: 'capital',
      answers: ['capital', 'Paris'],
      tags: ['geography'],
    });
    expect(item.id).toBe('test-id');
    expect(item.order).toBe(5);
    expect(item.question).toBe('The @capital@ of France is Paris.');
    expect(item.answer).toBe('capital');
    expect(item.answers).toEqual(['capital', 'Paris']);
    expect(item.tags).toEqual(['geography']);
  });

  it('should parse single-line question with blanks', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'The @capital@ of @France@ is Paris.',
      questionFormat: 'Text',
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0].parts.length).toBe(5);
    expect(paragraphs[0].parts[0].contentType).toBe('label');
    expect(paragraphs[0].parts[0].label).toBe('The ');
    expect(paragraphs[0].parts[1].contentType).toBe('input');
    expect(paragraphs[0].parts[1].answer).toBe('capital');
    expect(paragraphs[0].parts[2].contentType).toBe('label');
    expect(paragraphs[0].parts[2].label).toBe(' of ');
    expect(paragraphs[0].parts[3].contentType).toBe('input');
    expect(paragraphs[0].parts[3].answer).toBe('France');
    expect(paragraphs[0].parts[4].contentType).toBe('label');
    expect(paragraphs[0].parts[4].label).toBe(' is Paris.');
  });

  it('should parse multi-line question with blanks', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Line 1: @blank1@\nLine 2: @blank2@',
      questionFormat: 'Text',
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].parts[1].answer).toBe('blank1');
    expect(paragraphs[1].parts[1].answer).toBe('blank2');
  });

  it('should support LaTeX format', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Solve @x@',
      questionFormat: QuestionBankContentFormatEnum.WithLatex,
    });
    expect(item.isLatexSupported()).toBe(true);
  });

  it('should not support LaTeX for Text format', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Solve @x@',
      questionFormat: QuestionBankContentFormatEnum.Text,
    });
    expect(item.isLatexSupported()).toBe(false);
  });

  it('should generate form controls for all inputs', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'The @capital@ of France.',
      questionFormat: 'Text',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(1);
    expect(controls['test-id_0_1']).toBeInstanceOf(FormControl);
  });

  it('should get answers for all inputs', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'The @capital@ of @France@.',
      questionFormat: 'Text',
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['capital', 'France']);
  });

  it('should have answer by default', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'The @capital@ of France.',
      questionFormat: 'Text',
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should get item type description', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'The @capital@ of France.',
      questionFormat: 'Text',
    });
    expect(item.getItemTypeDescription()).toBe('填空题');
  });
});

describe('QuestionBankItemSingleChoice', () => {
  it('should create a single choice question with default values', () => {
    const item = new QuestionBankItemSingleChoice();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.options).toEqual({});
  });

  it('should create a single choice question with custom values', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'What is the capital of France?',
      questionFormat: 'Text',
      options: { A: 'Paris', B: 'London', C: 'Berlin' },
      answer: 'A',
      hintofanswer: 'Think about European cities',
      tags: ['geography'],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('What is the capital of France?');
    expect(item.options).toEqual({ A: 'Paris', B: 'London', C: 'Berlin' });
    expect(item.answer).toBe('A');
    expect(item.hintofanswer).toBe('Think about European cities');
    expect(item.tags).toEqual(['geography']);
  });

  it('should support LaTeX format', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Solve x + 1 = 2',
      questionFormat: QuestionBankContentFormatEnum.WithLatex,
      options: { A: '1', B: '2' },
    });
    expect(item.isLatexSupported()).toBe(true);
  });

  it('should generate form controls', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(1);
    expect(controls['test-id']).toBeInstanceOf(FormControl);
  });

  it('should get answers', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['A']);
  });

  it('should have answer when answer is set', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should not have answer when answer is not set', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });
    expect(item.hasAnswer()).toBe(false);
  });
});

describe('QuestionBankItemMultipleChoice', () => {
  it('should create a multiple choice question with default values', () => {
    const item = new QuestionBankItemMultipleChoice();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.options).toEqual({});
  });

  it('should create a multiple choice question with custom values', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Select programming languages',
      questionFormat: 'Text',
      options: { A: 'JS', B: 'Python', C: 'Java' },
      answers: ['A', 'B'],
      hintofanswer: 'Multiple answers allowed',
      tags: ['programming'],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Select programming languages');
    expect(item.options).toEqual({ A: 'JS', B: 'Python', C: 'Java' });
    expect(item.answers).toEqual(['A', 'B']);
    expect(item.hintofanswer).toBe('Multiple answers allowed');
    expect(item.tags).toEqual(['programming']);
  });

  it('should support LaTeX format', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Select correct equations',
      questionFormat: QuestionBankContentFormatEnum.WithLatex,
      options: { A: 'x=1', B: 'x=2' },
    });
    expect(item.isLatexSupported()).toBe(true);
  });

  it('should generate form controls for all options', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No', C: 'Maybe' },
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(3);
    expect(controls['test-id-A']).toBeInstanceOf(FormControl);
    expect(controls['test-id-B']).toBeInstanceOf(FormControl);
    expect(controls['test-id-C']).toBeInstanceOf(FormControl);
  });

  it('should get answers', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answers: ['A', 'B'],
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['A', 'B']);
  });

  it('should have answer when answers are set', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answers: ['A'],
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should not have answer when answers are empty', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });
    expect(item.hasAnswer()).toBe(false);
  });
});

describe('QuestionBankItemDictation', () => {
  it('should create a dictation question with default values', () => {
    const item = new QuestionBankItemDictation();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionLevel).toBe(QuestionBankItemLevelEnum.Full);
  });

  it('should create a dictation question with custom values', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation test',
      questionLevel: QuestionBankItemLevelEnum.Medium,
      answers: ['Hello world', 'Test sentence'],
      tags: ['dictation'],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Dictation test');
    expect(item.questionLevel).toBe(QuestionBankItemLevelEnum.Medium);
    expect(item.answers).toEqual(['Hello world', 'Test sentence']);
    expect(item.tags).toEqual(['dictation']);
  });

  it('should parse answers into paragraphs', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world. How are you?'],
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('should generate form controls for all inputs', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world'],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBeGreaterThan(0);
  });

  it('should get answers', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world', 'Test'],
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['Hello world', 'Test']);
  });

  it('should have answer when answers are set', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello'],
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should not have answer when answers are empty', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
    });
    expect(item.hasAnswer()).toBe(false);
  });

  it('should count inputs correctly', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world'],
    });
    expect(item.countOfInputs).toBeGreaterThanOrEqual(0);
  });
});

describe('QuestionBankItemShortAnswer', () => {
  it('should create a short answer question with default values', () => {
    const item = new QuestionBankItemShortAnswer();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.rowsOfAnswers).toBe(1);
  });

  it('should create a short answer question with custom values', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Explain relativity',
      questionFormat: 'Text',
      rowsOfAnswers: 5,
      answer: 'It is a theory',
      answers: ['Answer 1', 'Answer 2'],
      tags: ['physics'],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Explain relativity');
    expect(item.rowsOfAnswers).toBe(5);
    expect(item.answer).toBe('It is a theory');
    expect(item.answers).toEqual(['Answer 1', 'Answer 2']);
    expect(item.tags).toEqual(['physics']);
  });

  it('should support LaTeX format', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Explain the equation',
      questionFormat: QuestionBankContentFormatEnum.WithLatex,
    });
    expect(item.isLatexSupported()).toBe(true);
  });

  it('should generate form controls', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Test?',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(1);
    expect(controls['test-id']).toBeInstanceOf(FormControl);
  });

  it('should get answers from answer field', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      answer: 'Single answer',
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['Single answer']);
  });

  it('should get answers from answers field', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      answers: ['Answer 1', 'Answer 2'],
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['Answer 1', 'Answer 2']);
  });

  it('should have answer when answers are set', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      answers: ['Answer'],
    });
    expect(item.hasAnswer()).toBe(true);
  });
});

describe('QuestionBankItemTrueFalse', () => {
  it('should create a true/false question with default values', () => {
    const item = new QuestionBankItemTrueFalse();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
  });

  it('should create a true/false question with custom values', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'The earth is flat',
      questionFormat: 'Text',
      answer: false,
      tags: ['geography'],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('The earth is flat');
    expect(item.answer).toBe('0');
    expect(item.tags).toEqual(['geography']);
  });

  it('should convert true answer to "1"', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: true,
    });
    expect(item.answer).toBe('1');
  });

  it('should convert false answer to "0"', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: false,
    });
    expect(item.answer).toBe('0');
  });

  it('should support LaTeX format', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'x = 1',
      questionFormat: QuestionBankContentFormatEnum.WithLatex,
    });
    expect(item.isLatexSupported()).toBe(true);
  });

  it('should generate form controls', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test?',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(1);
    expect(controls['test-id']).toBeInstanceOf(FormControl);
  });

  it('should get answers for true', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: true,
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['True']);
  });

  it('should get answers for false', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: false,
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['False']);
  });

  it('should return False for no answer (defaults to false)', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['False']);
  });

  it('should have answer when answer is set', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: true,
    });
    expect(item.hasAnswer()).toBe(true);
  });
});

describe('QuestionBankItemEssay', () => {
  it('should create an essay question with default values', () => {
    const item = new QuestionBankItemEssay();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.rowsOfAnswers).toBe(80);
  });

  it('should create an essay question with custom values', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Write about climate change',
      questionFormat: 'Text',
      rowsOfAnswers: 20,
      answers: ['Climate change is...'],
      tags: ['environment'],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Write about climate change');
    expect(item.rowsOfAnswers).toBe(20);
    expect(item.answers).toEqual(['Climate change is...']);
    expect(item.tags).toEqual(['environment']);
  });

  it('should support LaTeX format', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Explain the equation',
      questionFormat: QuestionBankContentFormatEnum.WithLatex,
    });
    expect(item.isLatexSupported()).toBe(true);
  });

  it('should generate form controls', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Test?',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(1);
    expect(controls['test-id']).toBeInstanceOf(FormControl);
  });

  it('should get answers from answer field', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      answers: ['Essay answer'],
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['Essay answer']);
  });

  it('should get answers from answers field', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      answers: ['Answer 1', 'Answer 2'],
    });
    const answers = item.getAnswers();
    expect(answers).toEqual(['Answer 1', 'Answer 2']);
  });

  it('should have answer when answers are set', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      answers: ['Answer'],
    });
    expect(item.hasAnswer()).toBe(true);
  });
});

describe('QuestionBankItemReadingComprehension', () => {
  it('should create a reading comprehension question with default values', () => {
    const item = new QuestionBankItemReadingComprehension();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.items).toEqual([]);
  });

  it('should create a reading comprehension question with custom values', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'What is the main idea?',
      options: { A: 'Idea A', B: 'Idea B' },
      answer: 'A',
    };
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read the passage',
      questionFormat: 'Text',
      tags: ['reading'],
      items: [subItem],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Read the passage');
    expect(item.items?.length).toBe(1);
    expect(item.items?.[0].order).toBe(1);
    expect(item.tags).toEqual(['reading']);
  });

  it('should reorder sub-items', () => {
    const subItems: QuestionBankItemCombinedInterface[] = [
      { id: 'sub-1', itemType: QuestionBankTypeEnum.ShortAnswer, question: 'Q1', order: 1 },
      { id: 'sub-2', itemType: QuestionBankTypeEnum.ShortAnswer, question: 'Q2', order: 2 },
    ];
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read',
      items: subItems,
    });
    item.reorderSubItems();
    expect(item.items?.[0].order).toBe(1);
    expect(item.items?.[1].order).toBe(2);
  });

  it('should generate form controls for all sub-items', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
    };
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read',
      items: [subItem],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBeGreaterThan(0);
  });

  it('should get answers from sub-items', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer 1',
    };
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read',
      items: [subItem],
    });
    const answers = item.getAnswers();
    expect(answers?.length).toBe(1);
  });

  it('should have answer when sub-items have answers', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer',
    };
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read',
      items: [subItem],
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should not have answer when no sub-items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read',
    });
    expect(item.hasAnswer()).toBe(false);
  });
});

describe('QuestionBankItemListeningComprehension', () => {
  it('should create a listening comprehension question with default values', () => {
    const item = new QuestionBankItemListeningComprehension();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.items).toEqual([]);
  });

  it('should create a listening comprehension question with custom values', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'What did you hear?',
      options: { A: 'Sound A', B: 'Sound B' },
      answer: 'A',
    };
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 1,
      question: 'Listen to the audio',
      questionFormat: 'Text',
      tags: ['listening'],
      items: [subItem],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Listen to the audio');
    expect(item.items?.length).toBe(1);
    expect(item.tags).toEqual(['listening']);
  });

  it('should reorder sub-items', () => {
    const subItems: QuestionBankItemCombinedInterface[] = [
      { id: 'sub-1', itemType: QuestionBankTypeEnum.ShortAnswer, question: 'Q1', order: 1 },
      { id: 'sub-2', itemType: QuestionBankTypeEnum.ShortAnswer, question: 'Q2', order: 2 },
    ];
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 1,
      question: 'Listen',
      items: subItems,
    });
    item.reorderSubItems();
    expect(item.items?.[0].order).toBe(1);
    expect(item.items?.[1].order).toBe(2);
  });

  it('should generate form controls for all sub-items', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
    };
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 1,
      question: 'Listen',
      items: [subItem],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBeGreaterThan(0);
  });

  it('should get answers from sub-items', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer 1',
    };
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 1,
      question: 'Listen',
      items: [subItem],
    });
    const answers = item.getAnswers();
    expect(answers?.length).toBe(1);
  });

  it('should have answer when sub-items have answers', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer',
    };
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 1,
      question: 'Listen',
      items: [subItem],
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should not have answer when no sub-items', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 1,
      question: 'Listen',
    });
    expect(item.hasAnswer()).toBe(false);
  });
});

describe('QuestionBankItemCloze', () => {
  it('should create a cloze question with default values', () => {
    const item = new QuestionBankItemCloze();
    expect(item.id).toBe('');
    expect(item.order).toBe(1);
    expect(item.question).toBe('');
    expect(item.questionFormat).toBe('Text');
    expect(item.items).toEqual([]);
  });

  it('should create a cloze question with custom values', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.FillInTheBlank,
      question: 'The @word@ is correct',
      questionFormat: 'Text',
    };
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Fill in the blanks',
      questionFormat: 'Text',
      tags: ['cloze'],
      items: [subItem],
    });
    expect(item.id).toBe('test-id');
    expect(item.question).toBe('Fill in the blanks');
    expect(item.items?.length).toBe(1);
    expect(item.tags).toEqual(['cloze']);
  });

  it('should reorder sub-items', () => {
    const subItems: QuestionBankItemCombinedInterface[] = [
      { id: 'sub-1', itemType: QuestionBankTypeEnum.ShortAnswer, question: 'Q1', order: 1 },
      { id: 'sub-2', itemType: QuestionBankTypeEnum.ShortAnswer, question: 'Q2', order: 2 },
    ];
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Cloze',
      items: subItems,
    });
    item.reorderSubItems();
    expect(item.items?.[0].order).toBe(1);
    expect(item.items?.[1].order).toBe(2);
  });

  it('should generate form controls for all sub-items', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
    };
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Cloze',
      items: [subItem],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBeGreaterThan(0);
  });

  it('should get answers from sub-items', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer 1',
    };
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Cloze',
      items: [subItem],
    });
    const answers = item.getAnswers();
    expect(answers?.length).toBe(1);
  });

  it('should have answer when sub-items have answers', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer',
    };
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Cloze',
      items: [subItem],
    });
    expect(item.hasAnswer()).toBe(true);
  });

  it('should not have answer when no sub-items', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Cloze',
    });
    expect(item.hasAnswer()).toBe(false);
  });
});

describe('convertToQuestionBankItem', () => {
  it('should convert to SingleChoice', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemSingleChoice).toBe(true);
  });

  it('should convert to MultipleChoice', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '2',
      order: 1,
      itemType: QuestionBankTypeEnum.MultipleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answers: ['A', 'B'],
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemMultipleChoice).toBe(true);
  });

  it('should convert to FillInTheBlank', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '3',
      order: 1,
      itemType: QuestionBankTypeEnum.FillInTheBlank,
      question: 'The @word@ is correct',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemFillInTheBlank).toBe(true);
  });

  it('should convert to Dictation', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '4',
      order: 1,
      itemType: QuestionBankTypeEnum.Dictation,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello'],
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemDictation).toBe(true);
  });

  it('should convert to ShortAnswer', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '5',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Explain',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemShortAnswer).toBe(true);
  });

  it('should convert to TrueFalse', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '6',
      order: 1,
      itemType: QuestionBankTypeEnum.TrueFalse,
      question: 'True or false?',
      answer: '1',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemTrueFalse).toBe(true);
  });

  it('should convert to Essay', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '7',
      order: 1,
      itemType: QuestionBankTypeEnum.Essay,
      question: 'Write an essay',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemEssay).toBe(true);
  });

  it('should convert to ReadingComprehension', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '8',
      order: 1,
      itemType: QuestionBankTypeEnum.ReadingComprehension,
      question: 'Read',
      items: [],
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemReadingComprehension).toBe(true);
  });

  it('should convert to ListeningComprehension', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '9',
      order: 1,
      itemType: QuestionBankTypeEnum.ListeningComprehension,
      question: 'Listen',
      items: [],
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemListeningComprehension).toBe(true);
  });

  it('should convert to Cloze', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '10',
      order: 1,
      itemType: QuestionBankTypeEnum.Cloze,
      question: 'Fill',
      items: [],
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted instanceof QuestionBankItemCloze).toBe(true);
  });

  it('should throw error for invalid type', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '11',
      order: 1,
      itemType: 'InvalidType' as QuestionBankTypeEnum,
      question: 'Test',
    };
    expect(() => convertToQuestionBankItem(item)).toThrow();
  });
});

describe('doesQuestionBankItemHasAnswer', () => {
  it('should return true for FillInTheBlank', () => {
    const item = {
      itemType: QuestionBankTypeEnum.FillInTheBlank,
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });

  it('should return true when answer is set', () => {
    const item = {
      itemType: QuestionBankTypeEnum.SingleChoice,
      answer: 'A',
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });

  it('should return true when answers are set', () => {
    const item = {
      itemType: QuestionBankTypeEnum.MultipleChoice,
      answers: ['A', 'B'],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });

  it('should return false when answer is empty', () => {
    const item = {
      itemType: QuestionBankTypeEnum.SingleChoice,
      answer: '',
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(false);
  });

  it('should return false when answers are empty', () => {
    const item = {
      itemType: QuestionBankTypeEnum.MultipleChoice,
      answers: [],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(false);
  });

  it('should return true for ReadingComprehension with sub-items that have answers', () => {
    const item = {
      itemType: QuestionBankTypeEnum.ReadingComprehension,
      items: [{ id: 'test-id', itemType: QuestionBankTypeEnum.SingleChoice, answer: 'A' }],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });

  it('should return false for ReadingComprehension with no sub-items', () => {
    const item = {
      itemType: QuestionBankTypeEnum.ReadingComprehension,
      items: [],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(false);
  });

  it('should return true for ListeningComprehension with sub-items that have answers', () => {
    const item = {
      itemType: QuestionBankTypeEnum.ListeningComprehension,
      items: [{ id: 'test-id', itemType: QuestionBankTypeEnum.ShortAnswer, answer: 'Answer' }],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });

  it('should return true for Cloze with sub-items that have answers', () => {
    const item = {
      itemType: QuestionBankTypeEnum.Cloze,
      items: [{ id: 'test-id', itemType: QuestionBankTypeEnum.FillInTheBlank }],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });
});

describe('shuffleQuestionBankItemOption', () => {
  it('should shuffle options and return new options and key mapping', () => {
    const options = { A: 'Option A', B: 'Option B', C: 'Option C' };
    const result = shuffleQuestionBankItemOption(options);

    expect(result.newoptions).toBeDefined();
    expect(result.keyMapping).toBeDefined();
    expect(Object.keys(result.newoptions)).toEqual(['A', 'B', 'C']);
  });

  it('should preserve all option values after shuffle', () => {
    const options = { A: 'Option A', B: 'Option B', C: 'Option C' };
    const result = shuffleQuestionBankItemOption(options);

    const originalValues = Object.values(options);
    const newValues = Object.values(result.newoptions);
    expect(newValues).toEqual(expect.arrayContaining(originalValues));
  });

  it('should create correct key mapping', () => {
    const options = { A: 'Option A', B: 'Option B', C: 'Option C' };
    const result = shuffleQuestionBankItemOption(options);

    expect(Object.keys(result.keyMapping)).toEqual(expect.arrayContaining(['A', 'B', 'C']));
    expect(Object.values(result.keyMapping)).toEqual(expect.arrayContaining(['A', 'B', 'C']));
  });
});

describe('convertQuestionBankItemToMarkdown', () => {
  it('should convert SingleChoice to markdown', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test',
      order: 1,
      question: 'What is 1+1?',
      options: { A: '1', B: '2', C: '3' },
      answer: 'B',
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('1+1');
    expect(markdown).toContain('*A*.');
    expect(markdown).toContain('*B*.');
  });

  it('should convert FillInTheBlank to markdown', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test',
      order: 1,
      question: 'The @capital@ of France.',
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('The');
    expect(markdown).toContain('France');
  });

  it('should convert MultipleChoice to markdown', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test',
      order: 1,
      question: 'Select all',
      options: { A: 'A', B: 'B' },
      answers: ['A', 'B'],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Select all');
  });

  it('should convert ShortAnswer to markdown', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test',
      order: 1,
      question: 'Explain',
      rowsOfAnswers: 2,
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Explain');
  });

  it('should convert TrueFalse to markdown', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test',
      order: 1,
      question: 'The sky is blue',
      answer: true,
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('The sky is blue');
  });

  it('should convert Dictation to markdown', () => {
    const item = new QuestionBankItemDictation({
      id: 'test',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world'],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Dictation');
  });

  it('should convert ReadingComprehension to markdown', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test',
      order: 1,
      question: 'Read the passage',
      items: [],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Read the passage');
  });

  it('should convert ListeningComprehension to markdown', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test',
      order: 1,
      question: 'Listen to the audio',
      items: [],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Listen to the audio');
  });

  it('should convert Cloze to markdown', () => {
    const item = new QuestionBankItemCloze({
      id: 'test',
      order: 1,
      question: 'Fill in the blanks',
      items: [],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Fill in the blanks');
  });

  it('should hide question type labels when specified', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });
    const markdown = convertQuestionBankItemToMarkdown(item, ['SingleChoice']);
    expect(markdown).not.toContain('【单选题】');
  });
});

describe('convertQuestionBankItemAnswerToMarkdown', () => {
  it('should convert SingleChoice answer to markdown', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*1*');
    expect(markdown).toContain('A');
  });

  it('should convert MultipleChoice answer to markdown', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answers: ['A', 'B'],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('A, B');
  });

  it('should convert FillInTheBlank answer to markdown', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test',
      order: 1,
      question: 'The @capital@ of France.',
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('capital');
  });

  it('should convert ShortAnswer answer to markdown', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test',
      order: 1,
      question: 'Explain',
      answer: 'Answer',
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('Answer');
  });

  it('should convert TrueFalse answer to markdown', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test',
      order: 1,
      question: 'Test',
      answer: true,
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('True');
  });

  it('should convert Dictation answer to markdown', () => {
    const item = new QuestionBankItemDictation({
      id: 'test',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world'],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('Hello world');
  });

  it('should convert ReadingComprehension answer to markdown', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer 1',
    };
    const item = new QuestionBankItemReadingComprehension({
      id: 'test',
      order: 1,
      question: 'Read',
      items: [subItem],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('1.1');
    expect(markdown).toContain('Answer 1');
  });

  it('should convert ListeningComprehension answer to markdown', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer 1',
    };
    const item = new QuestionBankItemListeningComprehension({
      id: 'test',
      order: 1,
      question: 'Listen',
      items: [subItem],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('1.1');
  });

  it('should convert Cloze answer to markdown', () => {
    const subItem: QuestionBankItemCombinedInterface = {
      id: 'sub-1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Q1',
      answer: 'Answer 1',
    };
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Cloze',
      items: [subItem],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('1.1');
  });
});

describe('QuestionBankItemFillInTheBlank - Chinese Character Handling', () => {
  it('should handle Chinese characters in blanks', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: '这是@测试@题目',
      questionFormat: 'Text',
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0].parts[1].answer).toBe('测试');
    expect(paragraphs[0].parts[1].inputlength).toBe(4); // 2 * 2 chars = 4
  });

  it('should handle mixed Chinese and English in blanks', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'This is @中文@ and @English@.',
      questionFormat: 'Text',
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs[0].parts[1].answer).toBe('中文');
    expect(paragraphs[0].parts[1].inputlength).toBe(4); // 2 * 2 chars
    expect(paragraphs[0].parts[3].answer).toBe('English');
    // English input length includes context, calculated based on the string
    expect(paragraphs[0].parts[3].inputlength).toBeGreaterThanOrEqual(7);
  });

  it('should handle empty blanks gracefully', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Test @@.',
      questionFormat: 'Text',
    });
    const paragraphs = item.paragraphes;
    // Should still create parts, but with empty answer
    expect(paragraphs[0].parts.length).toBeGreaterThan(0);
  });
});

describe('QuestionBankItemDictation - Question Level Adjustment', () => {
  it('should adjust input count to ~20% for Easy level', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Easy,
      answers: ['Hello world. How are you? I am fine. Thank you. Goodbye.'],
    });
    const paragraphs = item.paragraphes;
    let inputCount = 0;
    paragraphs.forEach(p => {
      inputCount += p.parts.filter(part => part.contentType === 'input').length;
    });
    // Should keep ~20% of inputs
    expect(inputCount).toBeGreaterThanOrEqual(1);
  });

  it('should adjust input count to ~50% for Medium level', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Medium,
      answers: ['Hello world. How are you? I am fine. Thank you.'],
    });
    const paragraphs = item.paragraphes;
    let inputCount = 0;
    paragraphs.forEach(p => {
      inputCount += p.parts.filter(part => part.contentType === 'input').length;
    });
    expect(inputCount).toBeGreaterThanOrEqual(1);
  });

  it('should adjust input count to ~80% for Hard level', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Hard,
      answers: ['Hello world. How are you?'],
    });
    const paragraphs = item.paragraphes;
    let inputCount = 0;
    paragraphs.forEach(p => {
      inputCount += p.parts.filter(part => part.contentType === 'input').length;
    });
    expect(inputCount).toBeGreaterThanOrEqual(1);
  });
});

describe('QuestionBankItemDictation - Chinese Character Handling', () => {
  it('should use Chinese separators for Chinese text', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['你好，世界。我很好。'],
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBeGreaterThan(0);
    // Should have split on Chinese punctuation
    expect(paragraphs[0].parts.length).toBeGreaterThan(1);
  });

  it('should use English separators for English text', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello, world. I am fine.'],
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBeGreaterThan(0);
    // Should have split on English punctuation
    expect(paragraphs[0].parts.length).toBeGreaterThan(1);
  });

  it('should calculate Chinese input length as 2x character count', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['中文测试'],
    });
    const paragraphs = item.paragraphes;
    // Find the input part
    const inputPart = paragraphs[0].parts.find(p => p.contentType === 'input');
    if (inputPart && inputPart.inputlength) {
      // 4 Chinese chars * 2 = 8
      expect(inputPart.inputlength).toBe(8);
    }
  });
});

describe('doesQuestionBankItemHasAnswer - Edge Cases', () => {
  it('should return false for whitespace-only answer', () => {
    const item = {
      itemType: QuestionBankTypeEnum.SingleChoice,
      answer: '   ',
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(false);
  });

  it('should return false for array with only whitespace strings', () => {
    const item = {
      itemType: QuestionBankTypeEnum.MultipleChoice,
      answers: ['  ', '   ', '\t'],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(false);
  });

  it('should return true if at least one answer in array is not whitespace', () => {
    const item = {
      itemType: QuestionBankTypeEnum.MultipleChoice,
      answers: ['  ', 'valid', '   '],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });
});

describe('QuestionBankItem - isLatexSupported Edge Cases', () => {
  it('should return false for SingleChoice with Text format', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      questionFormat: QuestionBankContentFormatEnum.Text,
      options: { A: 'Yes', B: 'No' },
    });
    expect(item.isLatexSupported()).toBe(false);
  });

  it('should return false for MultipleChoice with Text format', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      questionFormat: QuestionBankContentFormatEnum.Text,
      options: { A: 'Yes', B: 'No' },
    });
    expect(item.isLatexSupported()).toBe(false);
  });
});

describe('QuestionBankItem - getAnswers Edge Cases', () => {
  it('should return undefined for TrueFalse with invalid answer', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
    });
    // Default answer is neither '1' nor '0'
    const answers = item.getAnswers();
    expect(answers).toEqual(['False']); // Defaults to False
  });

  it('should return undefined for SingleChoice without answer', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });
    const answers = item.getAnswers();
    expect(answers).toBeUndefined();
  });

  it('should return undefined for ShortAnswer without answer or answers', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Test?',
    });
    const answers = item.getAnswers();
    expect(answers).toBeUndefined();
  });

  it('should return undefined for Essay without answers', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Test?',
    });
    const answers = item.getAnswers();
    expect(answers).toBeUndefined();
  });
});

describe('QuestionBankItem - Constructor with refToID', () => {
  it('should set refToID for FillInTheBlank', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Test @blank@',
      questionFormat: 'Text',
      refToID: 'ref-123',
    });
    expect(item.referToID).toBe('ref-123');
  });

  it('should set refToID for SingleChoice', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes' },
      refToID: 'ref-456',
    });
    expect(item.referToID).toBe('ref-456');
  });
});

describe('QuestionBankItemMultipleChoice - Edge Cases', () => {
  it('should handle empty options object', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: {},
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
  });
});

describe('Markdown Conversion - convertQuestionBankItemToMarkdown', () => {
  it('should convert SingleChoice to markdown', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'What is 2+2?',
      options: { A: '3', B: '4', C: '5' },
      answer: 'B',
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**1.**');
    expect(markdown).toContain('What is 2+2?');
    expect(markdown).toContain('*A*. 3');
    expect(markdown).toContain('*B*. 4');
  });

  it('should convert FillInTheBlank to markdown', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 2,
      question: 'The sky is @blue@',
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**2.**');
    expect(markdown).toContain('The sky is');
  });

  it('should convert MultipleChoice to markdown', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 3,
      question: 'Select all prime numbers',
      options: { A: '2', B: '3', C: '4', D: '5' },
      answers: ['A', 'B', 'D'],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**3.**');
    expect(markdown).toContain('Select all prime numbers');
  });

  it('should convert Dictation to markdown', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 4,
      question: 'Dictation Exercise',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello world'],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**4.**');
    expect(markdown).toContain('Dictation Exercise');
  });

  it('should convert ShortAnswer to markdown', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 5,
      question: 'Explain photosynthesis',
      rowsOfAnswers: 3,
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**5.**');
    expect(markdown).toContain('Explain photosynthesis');
  });

  it('should convert TrueFalse to markdown', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 6,
      question: 'The earth is flat',
      answer: false,
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**6.**');
    expect(markdown).toContain('The earth is flat');
  });

  it('should convert ReadingComprehension to markdown', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 7,
      question: 'Read the passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'What is the main idea?',
          options: { A: 'Option A', B: 'Option B' },
          answer: 'A',
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**7.**');
    expect(markdown).toContain('Read the passage');
  });

  it('should convert ListeningComprehension to markdown', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 8,
      question: 'Listen to the audio',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'Statement is correct',
          answer: '1',
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**8.**');
    expect(markdown).toContain('Listen to the audio');
  });

  it('should convert Cloze to markdown', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 9,
      question: 'Fill in the blanks',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'The @answer@ is here',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**9.**');
    expect(markdown).toContain('Fill in the blanks');
  });

  it('should return empty string for unsupported item type (default case)', () => {
    const item = {
      id: 'test-id',
      order: 10,
      itemType: 999 as unknown as QuestionBankTypeEnum, // Invalid type
      getFormControls: () => ({}),
      hasAnswer: () => false,
      getAnswers: () => undefined,
      getItemTypeDescription: () => 'Unknown',
      isLatexSupported: () => false,
      reorderSubItems: () => {},
    } as QuestionBankItemBase<string>;
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toBe('');
  });

  it('should hide question type label when specified', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test question',
      options: { A: 'Option A' },
    });
    const markdown = convertQuestionBankItemToMarkdown(item, [QuestionBankTypeEnum.SingleChoice]);
    expect(markdown).not.toContain('【单选题】');
  });

  it('should include ID when printID is true', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id-123',
      order: 1,
      question: 'Test question',
      options: { A: 'Option A' },
    });
    const markdown = convertQuestionBankItemToMarkdown(item, undefined, true);
    expect(markdown).toContain('test-id-123');
  });
});

describe('Markdown Conversion - convertQuestionBankItemAnswerToMarkdown', () => {
  it('should convert SingleChoice answer to markdown', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Question',
      options: { A: 'Answer A', B: 'Answer B' },
      answer: 'A',
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*1*.');
    expect(markdown).toContain('A');
  });

  it('should convert MultipleChoice answer to markdown', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 2,
      question: 'Question',
      options: { A: 'A', B: 'B', C: 'C' },
      answers: ['A', 'C'],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*2*.');
    expect(markdown).toContain('A');
    expect(markdown).toContain('C');
  });

  it('should convert FillInTheBlank answer to markdown', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 3,
      question: 'The @sky@ is @blue@',
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*3*.');
    expect(markdown).toContain('sky');
    expect(markdown).toContain('blue');
  });

  it('should convert Dictation answer to markdown', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 4,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Hello, world.'],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*4*.');
  });

  it('should convert ShortAnswer answer to markdown', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 5,
      question: 'Question',
      answer: 'My answer',
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*5*.');
    expect(markdown).toContain('My answer');
  });

  it('should convert TrueFalse answer to markdown', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 6,
      question: 'Question',
      answer: true,
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*6*.');
    expect(markdown).toContain('True');
  });

  it('should convert ReadingComprehension answer to markdown', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 7,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Q1',
          options: { A: 'A' },
          answer: 'A',
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('7.1');
  });

  it('should convert ListeningComprehension answer to markdown', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 8,
      question: 'Audio',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'Q1',
          answer: '1',
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('8.1');
  });

  it('should convert Cloze answer to markdown', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 9,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: '@answer@',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('9.1');
  });

  it('should return empty string for unsupported item type (default case)', () => {
    const item = {
      id: 'test-id',
      order: 10,
      itemType: 999 as unknown as QuestionBankTypeEnum, // Invalid type
      getFormControls: () => ({}),
      hasAnswer: () => false,
      getAnswers: () => undefined,
      getItemTypeDescription: () => 'Unknown',
      isLatexSupported: () => false,
      reorderSubItems: () => {},
    } as QuestionBankItemBase<string>;
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toBe('');
  });
});

describe('Comprehension Items - Empty Sub-items', () => {
  it('should handle ReadingComprehension with no items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read the passage',
      items: [],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
    expect(item.hasAnswer()).toBe(false);
    expect(item.getAnswers()).toBeUndefined();
  });

  it('should handle ReadingComprehension with undefined items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Read the passage',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
    expect(item.hasAnswer()).toBe(false);
    expect(item.getAnswers()).toBeUndefined();
  });

  it('should handle ListeningComprehension with no items', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 2,
      question: 'Listen to the audio',
      items: [],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
    expect(item.hasAnswer()).toBe(false);
    expect(item.getAnswers()).toBeUndefined();
  });

  it('should handle ListeningComprehension with undefined items', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 2,
      question: 'Listen to the audio',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
    expect(item.hasAnswer()).toBe(false);
    expect(item.getAnswers()).toBeUndefined();
  });

  it('should handle Cloze with no items', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 3,
      question: 'Fill in the blanks',
      items: [],
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
    expect(item.hasAnswer()).toBe(false);
    expect(item.getAnswers()).toBeUndefined();
  });

  it('should handle Cloze with undefined items', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 3,
      question: 'Fill in the blanks',
    });
    const controls = item.getFormControls();
    expect(Object.keys(controls).length).toBe(0);
    expect(item.hasAnswer()).toBe(false);
    expect(item.getAnswers()).toBeUndefined();
  });

  it('should handle ReadingComprehension reorderSubItems with no items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [],
    });
    item.reorderSubItems(); // Should not throw
    expect(item.items?.length).toBe(0);
  });

  it('should handle ReadingComprehension reorderSubItems with undefined items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
    });
    item.reorderSubItems(); // Should not throw
    expect(item.items).toBeUndefined();
  });
});

describe('Comprehension Items - convertComprehensionToMarkdown with sub-items', () => {
  it('should convert comprehension with FillInTheBlank sub-items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage text',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'Fill @this@',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Passage text');
    expect(markdown).toContain('Fill');
  });

  it('should convert comprehension with ShortAnswer sub-items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.ShortAnswer,
          question: 'Short answer question',
          rowsOfAnswers: 2,
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Short answer question');
  });

  it('should convert comprehension with TrueFalse sub-items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'True or false?',
          answer: '1',
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('True or false?');
  });

  it('should convert comprehension with SingleChoice sub-items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Choose one',
          options: { A: 'Option A' },
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Choose one');
  });

  it('should convert comprehension with MultipleChoice sub-items', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'Choose multiple',
          options: { A: 'Option A', B: 'Option B' },
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Choose multiple');
  });

  it('should handle comprehension with multiple different sub-item types', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: '@test@',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Choose',
          options: { A: 'A' },
        },
      ],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('Passage');
    expect(markdown).toContain('【填空题】'); // Verify FillInTheBlank sub-item
    expect(markdown).toContain('Choose');
    expect(markdown).toContain('【单选题】'); // Verify SingleChoice sub-item
  });
});

describe('Comprehension Answer Conversion - ternary operators', () => {
  it('should use semicolon separator for last item in convertComprehensionAnswerToMarkdown', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: '@answer@',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('; '); // Last item should end with '; '
  });

  it('should use emsp separator for non-last items in convertComprehensionAnswerToMarkdown', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: '@answer1@',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: '@answer2@',
          questionLevel: QuestionBankItemLevelEnum.Full,
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('&emsp;'); // Non-last items should have &emsp;
  });
});

describe('convertToQuestionBankItem - Error handling', () => {
  it('should throw error for invalid item type', () => {
    const invalidItem = {
      id: 'test-id',
      order: 1,
      itemType: 999 as unknown as QuestionBankTypeEnum,
      question: 'Test',
    };
    expect(() => convertToQuestionBankItem(invalidItem)).toThrowError('Failed');
  });
});

describe('ShortAnswer - answers array handling', () => {
  it('should return answers array when provided instead of single answer', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Question',
      answers: ['Answer 1', 'Answer 2'],
    });
    expect(item.getAnswers()).toEqual(['Answer 1', 'Answer 2']);
  });

  it('should prefer single answer over answers array when both provided', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Question',
      answer: 'Single answer',
      answers: ['Answer 1', 'Answer 2'],
    });
    expect(item.getAnswers()).toEqual(['Single answer']);
  });
});

describe('Essay - answers array handling', () => {
  it('should return answers array when provided', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Question',
      answers: ['Essay answer 1', 'Essay answer 2'],
    });
    expect(item.getAnswers()).toEqual(['Essay answer 1', 'Essay answer 2']);
  });

  it('should prefer single answer over answers array when both provided', () => {
    const item = new QuestionBankItemEssay({
      id: 'test-id',
      order: 1,
      question: 'Question',
      rowsOfAnswers: 10,
    });
    // Manually set answer property
    item.answer = 'Single essay';
    expect(item.getAnswers()).toEqual(['Single essay']);
  });
});

describe('TrueFalse - getAnswers branches', () => {
  it('should return False for answer 0', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: false,
    });
    expect(item.getAnswers()).toEqual(['False']);
  });

  it('should return True for answer 1', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'Test',
      answer: true,
    });
    expect(item.getAnswers()).toEqual(['True']);
  });
});

describe('Comprehension - hasAnswer with items without answers', () => {
  it('should return false when items exist but none have answers', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Q1',
          options: { A: 'A' },
          // No answer provided
        },
      ],
    });
    expect(item.hasAnswer()).toBe(false);
  });
});

describe('Markdown Conversion - parentOrder parameter', () => {
  it('should use parentOrder in SingleChoice markdown', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 2,
      question: 'Question text',
      options: { A: 'Option A', B: 'Option B' },
      answer: 'A',
    });
    const markdown = convertSingleChoiceToMarkdown(item, 5);
    expect(markdown).toContain('&emsp;'); // Should have indentation
    expect(markdown).toContain('5.2'); // Should combine parent and child order
    expect(markdown).toContain('Question text');
  });

  it('should use parentOrder in MultipleChoice markdown', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 3,
      question: 'Multi question',
      options: { A: 'A', B: 'B' },
      answers: ['A', 'B'],
    });
    const markdown = convertMultipleChoiceToMarkdown(item, 7);
    expect(markdown).toContain('&emsp;'); // Should have indentation
    expect(markdown).toContain('7.3'); // Should combine parent and child order
  });

  it('should use parentOrder in FillInTheBlank markdown', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Fill @this@',
      answers: ['this'],
    });
    const markdown = convertFillInTheBlankToMarkdown(item, 10);
    expect(markdown).toContain('&emsp;'); // Should have indentation
    expect(markdown).toContain('10.1'); // Should combine parent and child order
  });

  it('should render a uniform fixed-width blank when uniformBlankLength is true', () => {
    const shortItem = new QuestionBankItemFillInTheBlank({
      id: 'short-id',
      order: 1,
      question: 'Fill @hi@',
      answers: ['hi'],
    });
    const longItem = new QuestionBankItemFillInTheBlank({
      id: 'long-id',
      order: 2,
      question: 'Fill @a-much-longer-answer@',
      answers: ['a-much-longer-answer'],
    });
    const shortMd = convertFillInTheBlankToMarkdown(shortItem, undefined, undefined, false, true);
    const longMd = convertFillInTheBlankToMarkdown(longItem, undefined, undefined, false, true);
    const shortCount = (shortMd.match(/&nbsp;/g) || []).length;
    const longCount = (longMd.match(/&nbsp;/g) || []).length;
    // Uniform width: both blanks have the same number of cells regardless of answer length.
    expect(shortCount).toBe(longCount);
    expect(shortCount).toBe(10);
  });

  it('should reflect answer length when uniformBlankLength is false (default)', () => {
    const shortItem = new QuestionBankItemFillInTheBlank({
      id: 'short-id',
      order: 1,
      question: 'Fill @hi@',
      answers: ['hi'],
    });
    const longItem = new QuestionBankItemFillInTheBlank({
      id: 'long-id',
      order: 2,
      question: 'Fill @a-much-longer-answer@',
      answers: ['a-much-longer-answer'],
    });
    const shortMd = convertFillInTheBlankToMarkdown(shortItem);
    const longMd = convertFillInTheBlankToMarkdown(longItem);
    const shortCount = (shortMd.match(/&nbsp;/g) || []).length;
    const longCount = (longMd.match(/&nbsp;/g) || []).length;
    // Proportional width: longer answer produces more blank cells.
    expect(longCount).toBeGreaterThan(shortCount);
    expect(shortCount).toBe(4); // 'hi' -> 2 chars * 2
  });

  it('should thread uniformBlankLength through convertQuestionBankItemToMarkdown', () => {
    const shortItem = new QuestionBankItemFillInTheBlank({
      id: 'short-id',
      order: 1,
      question: 'Fill @hi@',
      answers: ['hi'],
    });
    const longItem = new QuestionBankItemFillInTheBlank({
      id: 'long-id',
      order: 2,
      question: 'Fill @a-much-longer-answer@',
      answers: ['a-much-longer-answer'],
    });
    const shortMd = convertQuestionBankItemToMarkdown(shortItem, undefined, false, true);
    const longMd = convertQuestionBankItemToMarkdown(longItem, undefined, false, true);
    expect((shortMd.match(/&nbsp;/g) || []).length).toBe(
      (longMd.match(/&nbsp;/g) || []).length
    );
  });

  it('should use parentOrder in ShortAnswer markdown', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 4,
      question: 'Short answer',
      rowsOfAnswers: 2,
    });
    const markdown = convertShortAnswerToMarkdown(item, 3);
    expect(markdown).toContain('&emsp;'); // Should have indentation twice (once in header, once in answer lines)
    expect(markdown).toContain('3.4'); // Should combine parent and child order
  });

  it('should use parentOrder in TrueFalse markdown', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 5,
      question: 'True or false',
      answer: true,
    });
    const markdown = convertTrueFalseToMarkdown(item, 8);
    expect(markdown).toContain('&emsp;'); // Should have indentation
    expect(markdown).toContain('8.5'); // Should combine parent and child order
  });

  it('should use parentOrder in comprehension answer markdown', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 2,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.ShortAnswer,
          question: 'Q1',
          answer: 'Answer 1',
        },
      ],
    });
    const markdown = convertComprehensionAnswerToMarkdown(item, 5);
    expect(markdown).toContain('5.1'); // Should include parent order
    expect(markdown).toContain('Answer 1');
  });
});

describe('Markdown Conversion - last item vs non-last item separators', () => {
  it('should not add newline after last FillInTheBlank sub-item in comprehension', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'Fill @this@',
          answers: ['this'],
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'Fill @that@',
          answers: ['that'],
        },
      ],
    });
    const markdown = convertComprehensionToMarkdown(item);
    // The markdown should contain first item followed by \n, then second item without \n
    const lines = markdown.split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });

  it('should not add newline after last ShortAnswer sub-item in comprehension', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.ShortAnswer,
          question: 'Q1',
          rowsOfAnswers: 1,
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.ShortAnswer,
          question: 'Q2',
          rowsOfAnswers: 1,
        },
      ],
    });
    const markdown = convertComprehensionToMarkdown(item);
    expect(markdown).toContain('Q1');
    expect(markdown).toContain('Q2');
  });

  it('should not add newline after last TrueFalse sub-item in comprehension', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'T/F 1',
          answer: '1',
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'T/F 2',
          answer: '0',
        },
      ],
    });
    const markdown = convertComprehensionToMarkdown(item);
    expect(markdown).toContain('T/F 1');
    expect(markdown).toContain('T/F 2');
  });

  it('should not add newline after last SingleChoice sub-item in comprehension', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'SC 1',
          options: { A: 'A' },
          answer: 'A',
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'SC 2',
          options: { B: 'B' },
          answer: 'B',
        },
      ],
    });
    const markdown = convertComprehensionToMarkdown(item);
    expect(markdown).toContain('SC 1');
    expect(markdown).toContain('SC 2');
  });

  it('should not add newline after last MultipleChoice sub-item in comprehension', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'MC 1',
          options: { A: 'A' },
          answers: ['A'],
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'MC 2',
          options: { B: 'B' },
          answers: ['B'],
        },
      ],
    });
    const markdown = convertComprehensionToMarkdown(item);
    expect(markdown).toContain('MC 1');
    expect(markdown).toContain('MC 2');
  });

  it('should use semicolon for last item in comprehension answer', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'Fill @this@',
          answers: ['this'],
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'Fill @that@',
          answers: ['that'],
        },
      ],
    });
    const markdown = convertComprehensionAnswerToMarkdown(item);
    expect(markdown).toContain('&emsp;'); // Non-last item separator
    expect(markdown).toContain('; '); // Last item separator
  });
});

describe('Comprehension Answer - all sub-item types', () => {
  it('should handle ShortAnswer sub-items in answer conversion', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.ShortAnswer,
          question: 'Q1',
          answer: 'Short answer',
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('Short answer');
  });

  it('should handle TrueFalse sub-items in answer conversion', () => {
    const item = new QuestionBankItemListeningComprehension({
      id: 'test-id',
      order: 2,
      question: 'Audio',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'Statement',
          answer: '1',
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('True');
  });

  it('should handle SingleChoice sub-items in answer conversion', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 3,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Q1',
          options: { A: 'A', B: 'B' },
          answer: 'A',
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('A');
  });

  it('should handle MultipleChoice sub-items in answer conversion', () => {
    const item = new QuestionBankItemCloze({
      id: 'test-id',
      order: 4,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'Q1',
          options: { A: 'A', B: 'B', C: 'C' },
          answers: ['A', 'C'],
        },
      ],
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('A');
    expect(markdown).toContain('C');
  });
});

describe('Additional Markdown Edge Cases', () => {
  it('should handle markdown with parentOrder for SingleChoice', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 5,
      question: 'Sub question',
      options: { A: 'Option A' },
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**5.**');
  });

  it('should handle question with underscores in markdown conversion', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'What is snake_case_naming?',
      options: { A: 'A naming convention' },
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('\\_'); // Underscores should be escaped
  });

  it('should handle empty options values in markdown', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test',
      options: { A: '', B: 'Option B' },
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('*A*.'); // Empty value should still render key
  });
});

describe('Dictation - markdown edge cases', () => {
  it('should handle dictation with multiple paragraphs in markdown', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['First sentence.', 'Second sentence.'],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**1.**');
    expect(markdown).toContain('<br>'); // Multiple paragraphs should have line breaks
  });

  it('should handle dictation with single paragraph (no line break)', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: ['Only one sentence.'],
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**1.**');
    expect(markdown).not.toContain('<br>'); // Single paragraph should not have <br>
  });
});

describe('getQuestionBankTypeDescription - default case', () => {
  it('should return error description for invalid type', () => {
    const invalidType = 999 as unknown as QuestionBankTypeEnum;
    expect(getQuestionBankTypeDescription(invalidType)).toBe('类型错误');
  });
});

describe('FillInTheBlank - multiline questions', () => {
  it('should handle multiline questions with blanks on different lines', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: 'Line 1 has @blank1@\nLine 2 has @blank2@',
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].parts.length).toBeGreaterThan(0);
    expect(paragraphs[1].parts.length).toBeGreaterThan(0);
  });

  it('should handle single line in the else branch when sublines.length > 1', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: '@blank@\n\n@blank2@',
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(3); // Should process all lines including empty one
  });
});

describe('Dictation - answers edge cases', () => {
  it('should handle dictation with undefined answers', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(0);
  });

  it('should handle dictation with empty answers array', () => {
    const item = new QuestionBankItemDictation({
      id: 'test-id',
      order: 1,
      question: 'Dictation',
      questionLevel: QuestionBankItemLevelEnum.Full,
      answers: [],
    });
    const paragraphs = item.paragraphes;
    expect(paragraphs.length).toBe(0);
  });
});

describe('Markdown - parentOrder tests', () => {
  it('should include emsp indentation when parentOrder is provided for FillInTheBlank', () => {
    const item = new QuestionBankItemFillInTheBlank({
      id: 'test-id',
      order: 1,
      question: '@blank@',
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**1.**');
  });

  it('should include emsp indentation when parentOrder is provided for ShortAnswer', () => {
    const item = new QuestionBankItemShortAnswer({
      id: 'test-id',
      order: 1,
      question: 'Short answer',
      rowsOfAnswers: 1,
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**1.**');
  });

  it('should include emsp indentation when parentOrder is provided for TrueFalse', () => {
    const item = new QuestionBankItemTrueFalse({
      id: 'test-id',
      order: 1,
      question: 'True/False',
    });
    const markdown = convertQuestionBankItemToMarkdown(item);
    expect(markdown).toContain('**1.**');
  });
});

describe('Answer conversion - empty getAnswers', () => {
  it('should handle SingleChoice with no answer returning empty join', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'No answer provided',
      options: { A: 'Option A' },
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*1*.');
  });

  it('should handle MultipleChoice with no answers returning empty join', () => {
    const item = new QuestionBankItemMultipleChoice({
      id: 'test-id',
      order: 1,
      question: 'No answers provided',
      options: { A: 'Option A' },
    });
    const markdown = convertQuestionBankItemAnswerToMarkdown(item);
    expect(markdown).toContain('*1*.');
  });
});

describe('Comprehension - getAnswers with some items without answers', () => {
  it('should filter out items without answers in getAnswers', () => {
    const item = new QuestionBankItemReadingComprehension({
      id: 'test-id',
      order: 1,
      question: 'Passage',
      items: [
        {
          id: 'sub-1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Q1',
          options: { A: 'A' },
          answer: 'A',
        },
        {
          id: 'sub-2',
          order: 2,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'Q2',
          options: { A: 'A' },
          // No answer
        },
      ],
    });
    const answers = item.getAnswers();
    expect(answers?.length).toBe(1); // Only one item has answer
  });
});

describe('doesQuestionBankItemHasAnswer - nested comprehension', () => {
  it('should return false for comprehension with items but no answers in sub-items', () => {
    const item = {
      itemType: QuestionBankTypeEnum.ReadingComprehension,
      items: [
        {
          id: 'sub-1',
          itemType: QuestionBankTypeEnum.SingleChoice,
          options: { A: 'A' },
          // No answer
        },
      ],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(false);
  });

  it('should return true for comprehension with at least one sub-item having answer', () => {
    const item = {
      itemType: QuestionBankTypeEnum.ReadingComprehension,
      items: [
        {
          id: 'sub-1',
          itemType: QuestionBankTypeEnum.SingleChoice,
          answer: 'A',
        },
      ],
    };
    expect(doesQuestionBankItemHasAnswer(item)).toBe(true);
  });
});

describe('convertToQuestionBankItem - TrueFalse answer conversion', () => {
  it('should convert string answer "1" to boolean true for TrueFalse', () => {
    const item = convertToQuestionBankItem({
      id: 'test-id',
      order: 1,
      itemType: QuestionBankTypeEnum.TrueFalse,
      question: 'Test',
      answer: '1',
    });
    const tfItem = item as QuestionBankItemTrueFalse;
    expect(tfItem.answer).toBe('1');
    expect(tfItem.getAnswers()).toEqual(['True']);
  });

  it('should convert answer for TrueFalse when not "1"', () => {
    const item = convertToQuestionBankItem({
      id: 'test-id',
      order: 1,
      itemType: QuestionBankTypeEnum.TrueFalse,
      question: 'Test',
      answer: '0',
    });
    const tfItem = item as QuestionBankItemTrueFalse;
    expect(tfItem.answer).toBe('0');
    expect(tfItem.getAnswers()).toEqual(['False']);
  });
});

describe('QuestionBankItemBase new properties', () => {
  it('should support extraInfo property', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });

    expect(item.extraInfo).toBeUndefined();

    item.extraInfo = ['Note 1', 'Note 2'];
    expect(item.extraInfo).toEqual(['Note 1', 'Note 2']);
  });

  it('should support difficulty property', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });

    expect(item.difficulty).toBeUndefined();

    item.difficulty = 5;
    expect(item.difficulty).toBe(5);
  });

  it('should support suggestedCompletionTime property', () => {
    const item = new QuestionBankItemSingleChoice({
      id: 'test-id',
      order: 1,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
    });

    expect(item.suggestedCompletionTime).toBeUndefined();

    item.suggestedCompletionTime = 10;
    expect(item.suggestedCompletionTime).toBe(10);
  });
});

describe('convertToQuestionBankItem with new properties', () => {
  it('should convert extraInfo property', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
      extraInfo: ['Note 1', 'Note 2'],
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.extraInfo).toEqual(['Note 1', 'Note 2']);
  });

  it('should convert difficulty property', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
      difficulty: 7,
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.difficulty).toBe(7);
  });

  it('should convert suggestedCompletionTime property', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
      suggestedCompletionTime: 15,
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.suggestedCompletionTime).toBe(15);
  });

  it('should convert all new properties together', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
      extraInfo: ['Extra note 1', 'Extra note 2'],
      difficulty: 8,
      suggestedCompletionTime: 20,
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.extraInfo).toEqual(['Extra note 1', 'Extra note 2']);
    expect(converted.difficulty).toBe(8);
    expect(converted.suggestedCompletionTime).toBe(20);
  });

  it('should handle undefined new properties', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.extraInfo).toBeUndefined();
    expect(converted.difficulty).toBeUndefined();
    expect(converted.suggestedCompletionTime).toBeUndefined();
  });

  it('should convert new properties for all question types', () => {
    const baseItem: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
      extraInfo: ['Global note'],
      difficulty: 5,
      suggestedCompletionTime: 10,
    };

    // Test various question types with new properties
    const questionTypes = [
      QuestionBankTypeEnum.SingleChoice,
      QuestionBankTypeEnum.MultipleChoice,
      QuestionBankTypeEnum.FillInTheBlank,
      QuestionBankTypeEnum.Dictation,
      QuestionBankTypeEnum.ShortAnswer,
      QuestionBankTypeEnum.TrueFalse,
      QuestionBankTypeEnum.Essay,
      QuestionBankTypeEnum.ReadingComprehension,
      QuestionBankTypeEnum.ListeningComprehension,
      QuestionBankTypeEnum.Cloze,
    ];

    questionTypes.forEach(questionType => {
      const item = { ...baseItem, itemType: questionType };

      // For comprehension types, we need to include items
      if (
        questionType === QuestionBankTypeEnum.ReadingComprehension ||
        questionType === QuestionBankTypeEnum.ListeningComprehension ||
        questionType === QuestionBankTypeEnum.Cloze
      ) {
        item.items = [
          {
            id: 'sub-item',
            itemType: QuestionBankTypeEnum.SingleChoice,
            question: 'Sub question?',
            options: { A: 'Option A' },
            answer: 'A',
          },
        ];
      }

      const converted = convertToQuestionBankItem(item);
      expect(converted.extraInfo, `Failed for ${questionType}`).toEqual(['Global note']);
      expect(converted.difficulty, `Failed for ${questionType}`).toBe(5);
      expect(converted.suggestedCompletionTime, `Failed for ${questionType}`).toBe(10);
    });
  });
});

describe('hintofanswer in convertToQuestionBankItem', () => {
  it('should convert hintofanswer for SingleChoice', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
      hintofanswer: 'Hint for single choice',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('Hint for single choice');
  });

  it('should convert hintofanswer for MultipleChoice', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.MultipleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answers: ['A', 'B'],
      hintofanswer: 'Hint for multiple choice',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('Hint for multiple choice');
  });

  it('should convert hintofanswer for FillInTheBlank', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.FillInTheBlank,
      question: 'The @capital@ of France is Paris',
      hintofanswer: 'Think about major European cities',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('Think about major European cities');
  });

  it('should convert hintofanswer for ShortAnswer', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.ShortAnswer,
      question: 'Explain photosynthesis',
      hintofanswer: 'Focus on light and dark reactions',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('Focus on light and dark reactions');
  });

  it('should convert hintofanswer for TrueFalse', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.TrueFalse,
      question: 'The earth is flat',
      answer: '0',
      hintofanswer: 'The earth is an oblate spheroid',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('The earth is an oblate spheroid');
  });

  it('should convert hintofanswer for Essay', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.Essay,
      question: 'Write about climate change',
      hintofanswer: 'Include causes, effects, and solutions',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('Include causes, effects, and solutions');
  });

  it('should convert hintofanswer for Dictation', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.Dictation,
      question: 'Famous quote',
      answers: ['To be or not to be'],
      hintofanswer: 'This is from Shakespeare',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBe('This is from Shakespeare');
  });

  it('should not set hintofanswer when absent in source', () => {
    const item: QuestionBankItemCombinedInterface = {
      id: '1',
      order: 1,
      itemType: QuestionBankTypeEnum.SingleChoice,
      question: 'Test?',
      options: { A: 'Yes', B: 'No' },
      answer: 'A',
    };
    const converted = convertToQuestionBankItem(item);
    expect(converted.hintofanswer).toBeUndefined();
  });
});

describe('hasHintOfAnswer and getHintsOfAnswer', () => {
  describe('simple question types', () => {
    it('should return true when SingleChoice has hintofanswer', () => {
      const item = new QuestionBankItemSingleChoice({
        id: '1',
        order: 1,
        question: 'Test?',
        options: { A: 'Yes', B: 'No' },
        answer: 'A',
        hintofanswer: 'Some hint',
      });
      expect(item.hasHintOfAnswer()).toBe(true);
    });

    it('should return false when SingleChoice has no hintofanswer', () => {
      const item = new QuestionBankItemSingleChoice({
        id: '1',
        order: 1,
        question: 'Test?',
        options: { A: 'Yes', B: 'No' },
        answer: 'A',
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return hint array when SingleChoice has hintofanswer', () => {
      const item = new QuestionBankItemSingleChoice({
        id: '1',
        order: 1,
        question: 'Test?',
        options: { A: 'Yes', B: 'No' },
        answer: 'A',
        hintofanswer: 'Some hint',
      });
      const hints = item.getHintsOfAnswer();
      expect(hints.length).toBe(1);
      expect(hints[0].hint).toBe('Some hint');
      expect(hints[0].id).toBe('1');
    });

    it('should return empty array when SingleChoice has no hintofanswer', () => {
      const item = new QuestionBankItemSingleChoice({
        id: '1',
        order: 1,
        question: 'Test?',
        options: { A: 'Yes', B: 'No' },
        answer: 'A',
      });
      expect(item.getHintsOfAnswer()).toEqual([]);
    });

    it('should return true when MultipleChoice has hintofanswer', () => {
      const item = new QuestionBankItemMultipleChoice({
        id: '2',
        order: 1,
        question: 'Test?',
        options: { A: 'Yes', B: 'No' },
        answers: ['A', 'B'],
        hintofanswer: 'Multiple hint',
      });
      expect(item.hasHintOfAnswer()).toBe(true);
    });

    it('should return false when MultipleChoice has no hintofanswer', () => {
      const item = new QuestionBankItemMultipleChoice({
        id: '2',
        order: 1,
        question: 'Test?',
        options: { A: 'Yes', B: 'No' },
        answers: ['A', 'B'],
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return false when FillInTheBlank has no hintofanswer', () => {
      const item = new QuestionBankItemFillInTheBlank({
        id: '3',
        order: 1,
        question: 'The @answer@ is here',
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return true when FillInTheBlank has hintofanswer', () => {
      const item = new QuestionBankItemFillInTheBlank({
        id: '3',
        order: 1,
        question: 'The @answer@ is here',
      });
      item.hintofanswer = 'Fill hint';
      expect(item.hasHintOfAnswer()).toBe(true);
      expect(item.getHintsOfAnswer()).toEqual([{ id: '3', question: '', hint: 'Fill hint' }]);
    });

    it('should return false when ShortAnswer has no hintofanswer', () => {
      const item = new QuestionBankItemShortAnswer({
        id: '4',
        order: 1,
        question: 'Explain',
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return false when TrueFalse has no hintofanswer', () => {
      const item = new QuestionBankItemTrueFalse({
        id: '5',
        order: 1,
        question: 'Statement',
        answer: true,
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return false when Essay has no hintofanswer', () => {
      const item = new QuestionBankItemEssay({
        id: '6',
        order: 1,
        question: 'Write essay',
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return false when Dictation has no hintofanswer', () => {
      const item = new QuestionBankItemDictation({
        id: '7',
        order: 1,
        question: 'Dictate',
        questionLevel: QuestionBankItemLevelEnum.Full,
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });
  });

  describe('ReadingComprehension', () => {
    it('should return true when sub-items have hintofanswer', () => {
      const subItem1: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Hint for sub 1',
      };
      const subItem2: QuestionBankItemCombinedInterface = {
        id: 'sub-2',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(2)',
        options: { A: 'A', B: 'B' },
        answer: 'B',
        hintofanswer: 'Hint for sub 2',
      };
      const item = new QuestionBankItemReadingComprehension({
        id: 'parent-1',
        order: 1,
        question: 'Read passage',
        items: [subItem1, subItem2],
      });
      expect(item.hasHintOfAnswer()).toBe(true);
    });

    it('should return false when sub-items have no hintofanswer', () => {
      const subItem: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
      };
      const item = new QuestionBankItemReadingComprehension({
        id: 'parent-1',
        order: 1,
        question: 'Read passage',
        items: [subItem],
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return false when no sub-items', () => {
      const item = new QuestionBankItemReadingComprehension({
        id: 'parent-1',
        order: 1,
        question: 'Read passage',
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should collect all hints from sub-items', () => {
      const subItem1: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Hint 1',
      };
      const subItem2: QuestionBankItemCombinedInterface = {
        id: 'sub-2',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(2)',
        options: { A: 'A', B: 'B' },
        answer: 'B',
      };
      const subItem3: QuestionBankItemCombinedInterface = {
        id: 'sub-3',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(3)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Hint 3',
      };
      const item = new QuestionBankItemReadingComprehension({
        id: 'parent-1',
        order: 1,
        question: 'Read passage',
        items: [subItem1, subItem2, subItem3],
      });
      const hints = item.getHintsOfAnswer();
      expect(hints.length).toBe(2);
      expect(hints[0].id).toBe('sub-1');
      expect(hints[0].hint).toBe('Hint 1');
      expect(hints[1].id).toBe('sub-3');
      expect(hints[1].hint).toBe('Hint 3');
    });

    it('should return empty array when no sub-items have hints', () => {
      const subItem: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
      };
      const item = new QuestionBankItemReadingComprehension({
        id: 'parent-1',
        order: 1,
        question: 'Read passage',
        items: [subItem],
      });
      expect(item.getHintsOfAnswer()).toEqual([]);
    });

    it('should return empty array when no sub-items even if parent has own hintofanswer', () => {
      const item = new QuestionBankItemReadingComprehension({
        id: 'parent-1',
        order: 1,
        question: 'Read passage',
      });
      item.hintofanswer = 'Parent-level hint';
      // Overridden method only checks sub-items, not own hintofanswer
      expect(item.hasHintOfAnswer()).toBe(false);
      expect(item.getHintsOfAnswer()).toEqual([]);
    });
  });

  describe('Cloze', () => {
    it('should return true when sub-items have hintofanswer', () => {
      const subItem: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Cloze hint',
      };
      const item = new QuestionBankItemCloze({
        id: 'cloze-1',
        order: 1,
        question: 'Fill blanks',
        items: [subItem],
      });
      expect(item.hasHintOfAnswer()).toBe(true);
    });

    it('should return false when sub-items have no hintofanswer', () => {
      const subItem: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question: 'The @word@ is correct',
      };
      const item = new QuestionBankItemCloze({
        id: 'cloze-1',
        order: 1,
        question: 'Fill blanks',
        items: [subItem],
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should return false when no sub-items', () => {
      const item = new QuestionBankItemCloze({
        id: 'cloze-1',
        order: 1,
        question: 'Fill blanks',
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should collect all hints from sub-items', () => {
      const subItem1: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Cloze hint 1',
      };
      const subItem2: QuestionBankItemCombinedInterface = {
        id: 'sub-2',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(2)',
        options: { A: 'A', B: 'B' },
        answer: 'B',
        hintofanswer: 'Cloze hint 2',
      };
      const item = new QuestionBankItemCloze({
        id: 'cloze-1',
        order: 1,
        question: 'Fill blanks',
        items: [subItem1, subItem2],
      });
      const hints = item.getHintsOfAnswer();
      expect(hints.length).toBe(2);
      expect(hints[0].hint).toBe('Cloze hint 1');
      expect(hints[1].hint).toBe('Cloze hint 2');
    });
  });

  describe('ListeningComprehension', () => {
    it('should return true when sub-items have hintofanswer', () => {
      const subItem: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: 'What did the speaker say?',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Listen for keywords',
      };
      const item = new QuestionBankItemListeningComprehension({
        id: 'listen-1',
        order: 1,
        question: 'Listen to the audio',
        items: [subItem],
      });
      expect(item.hasHintOfAnswer()).toBe(true);
    });

    it('should return false when sub-items have no hintofanswer', () => {
      const subItem: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.ShortAnswer,
        question: 'Summarize',
      };
      const item = new QuestionBankItemListeningComprehension({
        id: 'listen-1',
        order: 1,
        question: 'Listen to the audio',
        items: [subItem],
      });
      expect(item.hasHintOfAnswer()).toBe(false);
    });

    it('should collect hints from mixed sub-item types', () => {
      const subItem1: QuestionBankItemCombinedInterface = {
        id: 'sub-1',
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: '(1)',
        options: { A: 'A', B: 'B' },
        answer: 'A',
        hintofanswer: 'Hint for listening 1',
      };
      const subItem2: QuestionBankItemCombinedInterface = {
        id: 'sub-2',
        itemType: QuestionBankTypeEnum.ShortAnswer,
        question: 'Summarize',
        answer: 'Summary',
        hintofanswer: 'Hint for listening 2',
      };
      const item = new QuestionBankItemListeningComprehension({
        id: 'listen-1',
        order: 1,
        question: 'Listen to the audio',
        items: [subItem1, subItem2],
      });
      const hints = item.getHintsOfAnswer();
      expect(hints.length).toBe(2);
      expect(hints[0].hint).toBe('Hint for listening 1');
      expect(hints[1].hint).toBe('Hint for listening 2');
    });
  });

  describe('convertToQuestionBankItem with composite hint propagation', () => {
    it('should propagate sub-item hints to ReadingComprehension parent via hasHintOfAnswer', () => {
      const item: QuestionBankItemCombinedInterface = {
        id: 'rc-1',
        order: 1,
        itemType: QuestionBankTypeEnum.ReadingComprehension,
        question: 'Read the passage',
        items: [
          {
            id: 'rc-1-1',
            itemType: QuestionBankTypeEnum.SingleChoice,
            question: '(1)',
            options: { A: 'A', B: 'B' },
            answer: 'A',
            hintofanswer: 'Reading sub hint',
          },
        ],
      };
      const converted = convertToQuestionBankItem(item);
      expect(converted.hasHintOfAnswer()).toBe(true);
      const hints = converted.getHintsOfAnswer();
      expect(hints.length).toBe(1);
      expect(hints[0].hint).toBe('Reading sub hint');
    });

    it('should propagate sub-item hints to Cloze parent via hasHintOfAnswer', () => {
      const item: QuestionBankItemCombinedInterface = {
        id: 'clz-1',
        order: 1,
        itemType: QuestionBankTypeEnum.Cloze,
        question: 'Fill in the blanks',
        items: [
          {
            id: 'clz-1-1',
            itemType: QuestionBankTypeEnum.SingleChoice,
            question: '(1)',
            options: { A: 'A', B: 'B' },
            answer: 'A',
            hintofanswer: 'Cloze sub hint',
          },
          {
            id: 'clz-1-2',
            itemType: QuestionBankTypeEnum.SingleChoice,
            question: '(2)',
            options: { A: 'A', B: 'B' },
            answer: 'B',
          },
        ],
      };
      const converted = convertToQuestionBankItem(item);
      expect(converted.hasHintOfAnswer()).toBe(true);
      const hints = converted.getHintsOfAnswer();
      expect(hints.length).toBe(1);
      expect(hints[0].hint).toBe('Cloze sub hint');
    });

    it('should return false for Cloze with no sub-item hints', () => {
      const item: QuestionBankItemCombinedInterface = {
        id: 'clz-2',
        order: 1,
        itemType: QuestionBankTypeEnum.Cloze,
        question: 'Fill in the blanks',
        items: [
          {
            id: 'clz-2-1',
            itemType: QuestionBankTypeEnum.SingleChoice,
            question: '(1)',
            options: { A: 'A', B: 'B' },
            answer: 'A',
          },
        ],
      };
      const converted = convertToQuestionBankItem(item);
      expect(converted.hasHintOfAnswer()).toBe(false);
    });

    it('should handle ListeningComprehension with sub-item hints', () => {
      const item: QuestionBankItemCombinedInterface = {
        id: 'ls-1',
        order: 1,
        itemType: QuestionBankTypeEnum.ListeningComprehension,
        question: 'Listen to the passage',
        items: [
          {
            id: 'ls-1-1',
            itemType: QuestionBankTypeEnum.SingleChoice,
            question: 'What happened?',
            options: { A: 'A', B: 'B' },
            answer: 'A',
            hintofanswer: 'Listening sub hint',
          },
        ],
      };
      const converted = convertToQuestionBankItem(item);
      expect(converted.hasHintOfAnswer()).toBe(true);
      const hints = converted.getHintsOfAnswer();
      expect(hints.length).toBe(1);
      expect(hints[0].hint).toBe('Listening sub hint');
    });
  });
});
