import { TestBed } from '@angular/core/testing';
import { format } from 'date-fns';

import {
  ChineseExerciseTypeEnum,
  QuestionBankItemLevelEnum,
  VocabularyExcludedPartEnum,
} from '../interfaces';

import { UtilService } from './util.service';

describe('UtilService', () => {
  let service: UtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the expected date string', () => {
    const result = service.getEntryDateString();
    expect(result).toEqual('Date: __________. Start: _____, End: _____. Score: ____');
  });

  it('should return the expected character array', () => {
    const result = service.getAllCharacters();
    expect(result.length).toEqual(26);
    expect(result[0]).toEqual('a');
    expect(result[25]).toEqual('z');
  });

  describe('getEntryDateString', () => {
    it('should return formatted date when provided', () => {
      const testDate = new Date(2023, 0, 15); // Jan 15, 2023
      const result = service.getEntryDateString(testDate);
      const expected = `Date: ${format(testDate, 'yyyy-MM-dd')}. Start: _____, End: _____. Score: ____`;
      expect(result).toEqual(expected);
    });

    it('should return placeholders when no date provided', () => {
      const result = service.getEntryDateString();
      expect(result).toEqual('Date: __________. Start: _____, End: _____. Score: ____');
    });
  });

  describe('getAllTypingExcludeParts', () => {
    it('should return the expected exclude parts', () => {
      const result = service.getAllTypingExcludeParts();
      expect(result.length).toEqual(2);
      expect(result[0]).toEqual({ value: VocabularyExcludedPartEnum.word, label: 'Words' });
      expect(result[1]).toEqual({ value: VocabularyExcludedPartEnum.phase, label: 'Phases' });
    });
  });

  describe('getChineseExerciseTypeString', () => {
    it('should return correct string for ClassicalChinese', () => {
      const result = service.getChineseExerciseTypeString(ChineseExerciseTypeEnum.ClassicalChinese);
      expect(result).toBe('古诗词、文言文');
    });

    it('should return correct string for Composition', () => {
      const result = service.getChineseExerciseTypeString(ChineseExerciseTypeEnum.Composition);
      expect(result).toBe('作文');
    });

    it('should return correct string for Imitation', () => {
      const result = service.getChineseExerciseTypeString(ChineseExerciseTypeEnum.Imitation);
      expect(result).toBe('仿写');
    });

    it('should return correct string for FamousQuotation', () => {
      const result = service.getChineseExerciseTypeString(ChineseExerciseTypeEnum.FamousQuotation);
      expect(result).toBe('名言警句');
    });

    it('should return correct string for Reading', () => {
      const result = service.getChineseExerciseTypeString(ChineseExerciseTypeEnum.Reading);
      expect(result).toBe('阅读笔记');
    });

    it('should return empty string for invalid value', () => {
      const result = service.getChineseExerciseTypeString('invalid' as ChineseExerciseTypeEnum);
      expect(result).toBe('');
    });
  });

  describe('getExerciseLevelString', () => {
    it('should return correct string for Easy', () => {
      const result = service.getExerciseLevelString(QuestionBankItemLevelEnum.Easy);
      expect(result).toBe('简单');
    });

    it('should return correct string for Medium', () => {
      const result = service.getExerciseLevelString(QuestionBankItemLevelEnum.Medium);
      expect(result).toBe('中等');
    });

    it('should return correct string for Hard', () => {
      const result = service.getExerciseLevelString(QuestionBankItemLevelEnum.Hard);
      expect(result).toBe('困难');
    });

    it('should return 未定义 for unknown value', () => {
      const result = service.getExerciseLevelString('unknown' as QuestionBankItemLevelEnum);
      expect(result).toBe('未定义');
    });
  });

  describe('isChineseExerciseTypeHasContent', () => {
    it('should return true for ClassicalChinese', () => {
      expect(
        service.isChineseExerciseTypeHasContent(ChineseExerciseTypeEnum.ClassicalChinese)
      ).toBe(true);
    });

    it('should return true for Composition', () => {
      expect(service.isChineseExerciseTypeHasContent(ChineseExerciseTypeEnum.Composition)).toBe(
        true
      );
    });

    it('should return true for FamousQuotation', () => {
      expect(service.isChineseExerciseTypeHasContent(ChineseExerciseTypeEnum.FamousQuotation)).toBe(
        true
      );
    });

    it('should return true for Reading', () => {
      expect(service.isChineseExerciseTypeHasContent(ChineseExerciseTypeEnum.Reading)).toBe(true);
    });

    it('should return false for Imitation', () => {
      expect(service.isChineseExerciseTypeHasContent(ChineseExerciseTypeEnum.Imitation)).toBe(
        false
      );
    });
  });
});
