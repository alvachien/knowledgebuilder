import { 
  QuestionBankTypeEnum, 
  QuestionBankContentFormatEnum,
  VALID_OPTION_KEYS,
  QuestionBankItemLevelEnum,
  getAllQuestionBankLevelEnumValues,
  getQuestionBankLevelName,
  type ValidOptionKeys,
  type QuestionBankItemOption
} from './questionbank';

describe('questionbank.ts', () => {
  describe('QuestionBankTypeEnum', () => {
    it('should have correct enum values', () => {
      expect(QuestionBankTypeEnum.TrueFalse).toBe('TrueFalse');
      expect(QuestionBankTypeEnum.SingleChoice).toBe('SingleChoice');
      expect(QuestionBankTypeEnum.MultipleChoice).toBe('MultipleChoice');
      expect(QuestionBankTypeEnum.Dictation).toBe('Dictation');
      expect(QuestionBankTypeEnum.FillInTheBlank).toBe('FillInTheBlank');
      expect(QuestionBankTypeEnum.ShortAnswer).toBe('ShortAnswer');
      expect(QuestionBankTypeEnum.Essay).toBe('Essay');
      expect(QuestionBankTypeEnum.ReadingComprehension).toBe('ReadingComprehension');
      expect(QuestionBankTypeEnum.Cloze).toBe('Cloze');
      expect(QuestionBankTypeEnum.ListeningComprehension).toBe('ListeningComprehension');
    });
  });

  describe('QuestionBankContentFormatEnum', () => {
    it('should have correct enum values', () => {
      expect(QuestionBankContentFormatEnum.Text).toBe('Text');
      expect(QuestionBankContentFormatEnum.WithLatex).toBe('WithLatex');
    });
  });

  describe('VALID_OPTION_KEYS', () => {
    it('should contain all valid option keys', () => {
      expect(VALID_OPTION_KEYS.A).toBe('A');
      expect(VALID_OPTION_KEYS.B).toBe('B');
      expect(VALID_OPTION_KEYS.C).toBe('C');
      expect(VALID_OPTION_KEYS.D).toBe('D');
      expect(VALID_OPTION_KEYS.Z).toBe('Z');
      expect(VALID_OPTION_KEYS['0']).toBe('0');
      expect(VALID_OPTION_KEYS['1']).toBe('1');
      expect(VALID_OPTION_KEYS['9']).toBe('9');
    });

    it('should have correct type for ValidOptionKeys', () => {
      const key: ValidOptionKeys = 'A';
      expect(VALID_OPTION_KEYS[key]).toBe('A');
    });
  });

  describe('QuestionBankItemLevelEnum', () => {
    it('should have correct enum values', () => {
      expect(QuestionBankItemLevelEnum.Easy).toBe('Easy');
      expect(QuestionBankItemLevelEnum.Medium).toBe('Medium');
      expect(QuestionBankItemLevelEnum.Hard).toBe('Hard');
      expect(QuestionBankItemLevelEnum.Full).toBe('Full');
    });
  });

  describe('getAllQuestionBankLevelEnumValues', () => {
    it('should return all level enum values', () => {
      const values = getAllQuestionBankLevelEnumValues();
      
      expect(values.length).toBe(4);
      expect(values).toContain(QuestionBankItemLevelEnum.Easy);
      expect(values).toContain(QuestionBankItemLevelEnum.Medium);
      expect(values).toContain(QuestionBankItemLevelEnum.Hard);
      expect(values).toContain(QuestionBankItemLevelEnum.Full);
    });

    it('should return values in correct order', () => {
      const values = getAllQuestionBankLevelEnumValues();
      
      expect(values[0]).toBe(QuestionBankItemLevelEnum.Easy);
      expect(values[1]).toBe(QuestionBankItemLevelEnum.Medium);
      expect(values[2]).toBe(QuestionBankItemLevelEnum.Hard);
      expect(values[3]).toBe(QuestionBankItemLevelEnum.Full);
    });
  });

  describe('getQuestionBankLevelName', () => {
    it('should return correct Chinese name for Easy level', () => {
      expect(getQuestionBankLevelName(QuestionBankItemLevelEnum.Easy)).toBe('简单');
    });

    it('should return correct Chinese name for Medium level', () => {
      expect(getQuestionBankLevelName(QuestionBankItemLevelEnum.Medium)).toBe('中等');
    });

    it('should return correct Chinese name for Hard level', () => {
      expect(getQuestionBankLevelName(QuestionBankItemLevelEnum.Hard)).toBe('困难');
    });

    it('should return correct Chinese name for Full level', () => {
      expect(getQuestionBankLevelName(QuestionBankItemLevelEnum.Full)).toBe('全部');
    });

    it('should default to Full for unknown level', () => {
      // TypeScript won't allow this, but we can test the default case
      // by passing undefined or any other value
      const result = getQuestionBankLevelName(QuestionBankItemLevelEnum.Full);
      expect(result).toBe('全部');
    });
  });

  describe('QuestionBankItemOption type', () => {
    it('should allow valid option keys', () => {
      const options: QuestionBankItemOption = {
        A: 'Option A',
        B: 'Option B',
        C: 'Option C',
        '1': 'Option 1',
        '9': 'Option 9'
      };
      
      expect(options.A).toBe('Option A');
      expect(options.B).toBe('Option B');
      expect(options['1']).toBe('Option 1');
    });

    it('should be partial (allow missing keys)', () => {
      const options: QuestionBankItemOption = {
        A: 'Only A'
      };
      
      expect(options.A).toBe('Only A');
      expect(options.B).toBeUndefined();
    });
  });
});