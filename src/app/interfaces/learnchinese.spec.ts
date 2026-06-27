import {
  ChineseExerciseTypeEnum,
  getChineseReciteItemDisplayContent,
  convertChineseReciteItemToKnowledge,
  type LearnChineseFileItem,
} from './learnchinese';
import { QuestionBankTypeEnum, QuestionBankItemLevelEnum } from './questionbank';

describe('learnchinese.ts', () => {
  describe('ChineseExerciseTypeEnum', () => {
    it('should have correct enum values', () => {
      expect(ChineseExerciseTypeEnum.ClassicalChinese).toBe('Classical Chinese');
      expect(ChineseExerciseTypeEnum.Composition).toBe('Composition');
      expect(ChineseExerciseTypeEnum.Imitation).toBe('Imitation');
      expect(ChineseExerciseTypeEnum.FamousQuotation).toBe('Famous Quotation');
      expect(ChineseExerciseTypeEnum.Reading).toBe('Reading');
    });
  });

  describe('getChineseReciteItemDisplayContent', () => {
    it('should return empty string for item with no content or contentlength', () => {
      const item: LearnChineseFileItem = { subject: 'Test Subject' };
      expect(getChineseReciteItemDisplayContent(item)).toBe('');
    });

    it('should return content when content is provided', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Subject',
        content: 'Test content',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('Test content');
    });

    it('should return content1 when contentlength is 1', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Subject',
        contentlength: 1,
        content1: 'Content 1',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('Content 1');
    });

    it('should return concatenated content when contentlength > 1', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Subject',
        contentlength: 3,
        content1: 'Content 1',
        content2: 'Content 2',
        content3: 'Content 3',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('Content 1\nContent 2\nContent 3');
    });

    it('should handle missing content fields gracefully', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Subject',
        contentlength: 5,
        content1: 'Content 1',
        // content2 is missing
        content3: 'Content 3',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('Content 1\n\nContent 3\n\n');
    });

    it('should prioritize contentlength over content field', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Subject',
        content: 'Should be ignored',
        contentlength: 2,
        content1: 'Content 1',
        content2: 'Content 2',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('Content 1\nContent 2');
    });

    // Test all 39 content fields for getChineseReciteItemDisplayContent
    it('should handle contentlength up to 10', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 10,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
      };
      const result = getChineseReciteItemDisplayContent(item);
      expect(result).toBe('L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10');
    });

    it('should handle contentlength up to 20', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 20,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
        content11: 'L11',
        content12: 'L12',
        content13: 'L13',
        content14: 'L14',
        content15: 'L15',
        content16: 'L16',
        content17: 'L17',
        content18: 'L18',
        content19: 'L19',
        content20: 'L20',
      };
      const result = getChineseReciteItemDisplayContent(item);
      expect(result).toBe(
        'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20'
      );
    });

    it('should handle contentlength up to 30', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 30,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
        content11: 'L11',
        content12: 'L12',
        content13: 'L13',
        content14: 'L14',
        content15: 'L15',
        content16: 'L16',
        content17: 'L17',
        content18: 'L18',
        content19: 'L19',
        content20: 'L20',
        content21: 'L21',
        content22: 'L22',
        content23: 'L23',
        content24: 'L24',
        content25: 'L25',
        content26: 'L26',
        content27: 'L27',
        content28: 'L28',
        content29: 'L29',
        content30: 'L30',
      };
      const result = getChineseReciteItemDisplayContent(item);
      expect(result).toBe(
        'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21\nL22\nL23\nL24\nL25\nL26\nL27\nL28\nL29\nL30'
      );
    });

    it('should handle contentlength up to 39 (maximum)', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 39,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
        content11: 'L11',
        content12: 'L12',
        content13: 'L13',
        content14: 'L14',
        content15: 'L15',
        content16: 'L16',
        content17: 'L17',
        content18: 'L18',
        content19: 'L19',
        content20: 'L20',
        content21: 'L21',
        content22: 'L22',
        content23: 'L23',
        content24: 'L24',
        content25: 'L25',
        content26: 'L26',
        content27: 'L27',
        content28: 'L28',
        content29: 'L29',
        content30: 'L30',
        content31: 'L31',
        content32: 'L32',
        content33: 'L33',
        content34: 'L34',
        content35: 'L35',
        content36: 'L36',
        content37: 'L37',
        content38: 'L38',
        content39: 'L39',
      };
      const result = getChineseReciteItemDisplayContent(item);
      expect(result).toBe(
        'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21\nL22\nL23\nL24\nL25\nL26\nL27\nL28\nL29\nL30\nL31\nL32\nL33\nL34\nL35\nL36\nL37\nL38\nL39'
      );
    });

    // Test specific content field boundaries
    it('should handle contentlength 6 correctly', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 6,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('A\nB\nC\nD\nE\nF');
    });

    it('should handle contentlength 7 correctly', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 7,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
        content7: 'G',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('A\nB\nC\nD\nE\nF\nG');
    });

    it('should handle contentlength 8 correctly', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 8,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
        content7: 'G',
        content8: 'H',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('A\nB\nC\nD\nE\nF\nG\nH');
    });

    it('should handle contentlength 9 correctly', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 9,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
        content7: 'G',
        content8: 'H',
        content9: 'I',
      };
      expect(getChineseReciteItemDisplayContent(item)).toBe('A\nB\nC\nD\nE\nF\nG\nH\nI');
    });
  });

  describe('convertChineseReciteItemToKnowledge', () => {
    const mockItems: LearnChineseFileItem[] = [
      {
        subject: 'Poem 1',
        author: 'Author 1',
        content: 'Full content of poem 1',
      },
      {
        subject: 'Poem 2',
        author: 'Author 2',
        contentlength: 2,
        content1: 'First line',
        content2: 'Second line',
      },
    ];

    it('should convert items to knowledge exercises with correct structure', () => {
      const result = convertChineseReciteItemToKnowledge(mockItems);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(result[0].order).toBe(1);
      expect(result[1].id).toBe('2');
      expect(result[1].order).toBe(2);
    });

    it('should use Dictation type for fileVersion 1 (default)', () => {
      const result = convertChineseReciteItemToKnowledge([mockItems[0]]);

      expect(result[0].itemType).toBe(QuestionBankTypeEnum.Dictation);
      expect(result[0].questionLevel).toBe(QuestionBankItemLevelEnum.Full);
    });

    it('should use FillInTheBlank type for fileVersion 2', () => {
      const result = convertChineseReciteItemToKnowledge([mockItems[0]], 2);

      expect(result[0].itemType).toBe(QuestionBankTypeEnum.FillInTheBlank);
    });

    it('should use specified level parameter', () => {
      const result = convertChineseReciteItemToKnowledge([mockItems[0]], 1, QuestionBankItemLevelEnum.Hard);

      expect(result[0].questionLevel).toBe(QuestionBankItemLevelEnum.Hard);
    });

    it('should format question correctly for Dictation type without author', () => {
      const item: LearnChineseFileItem = {
        subject: 'Poem without author',
        content: 'Some content',
      };
      const result = convertChineseReciteItemToKnowledge([item]);

      expect(result[0].question).toBe('Poem without author');
    });

    it('should format question correctly for Dictation type with author', () => {
      const item: LearnChineseFileItem = {
        subject: 'Poem with author',
        author: 'Some Author',
        content: 'Some content',
      };
      const result = convertChineseReciteItemToKnowledge([item]);

      expect(result[0].question).toBe('Poem with author, Some Author');
    });

    it('should format question correctly for FillInTheBlank type without author', () => {
      const item: LearnChineseFileItem = {
        subject: 'Poem without author',
        content: 'Some content',
      };
      const result = convertChineseReciteItemToKnowledge([item], 2);

      expect(result[0].question).toBe('Poem without author. Some content');
    });

    it('should format question correctly for FillInTheBlank type with author', () => {
      const item: LearnChineseFileItem = {
        subject: 'Poem with author',
        author: 'Some Author',
        content: 'Some content',
      };
      const result = convertChineseReciteItemToKnowledge([item], 2);

      expect(result[0].question).toBe('Poem with author, Some Author. Some content');
    });

    it('should populate answers for Dictation type with contentlength', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Poem',
        contentlength: 3,
        content1: 'Line 1',
        content2: 'Line 2',
        content3: 'Line 3',
      };
      const result = convertChineseReciteItemToKnowledge([item]);

      expect(result[0].answers).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });

    it('should populate single answer for Dictation type with content only', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Poem',
        author: 'Test Author',
        content: 'Single line content',
      };
      const result = convertChineseReciteItemToKnowledge([item]);

      expect(result[0].answers).toEqual(['Single line content']);
    });

    it('should handle missing content fields in answers gracefully', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test Poem',
        contentlength: 5,
        content1: 'Line 1',
        // content2 missing
        content3: 'Line 3',
      };
      const result = convertChineseReciteItemToKnowledge([item]);

      expect(result[0].answers).toEqual(['Line 1', 'Line 3']);
    });

    it('should handle empty items array', () => {
      const result = convertChineseReciteItemToKnowledge([]);

      expect(result).toEqual([]);
    });

    it('should handle multiple items with mixed content types', () => {
      const mixedItems: LearnChineseFileItem[] = [
        {
          subject: 'Item 1',
          content: 'Simple content',
        },
        {
          subject: 'Item 2',
          contentlength: 2,
          content1: 'Part 1',
          content2: 'Part 2',
        },
        {
          subject: 'Item 3',
          author: 'Author 3',
          content: 'Content with author',
        },
      ];

      const result = convertChineseReciteItemToKnowledge(mixedItems);

      expect(result.length).toBe(3);
      expect(result[0].answers).toEqual(['Simple content']);
      expect(result[1].answers).toEqual(['Part 1', 'Part 2']);
      expect(result[2].answers).toEqual(['Content with author']);
    });

    // Test all 39 content fields for convertChineseReciteItemToKnowledge
    it('should populate answers for Dictation type with contentlength up to 10', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 10,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10']);
    });

    it('should populate answers for Dictation type with contentlength up to 20', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 20,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
        content11: 'L11',
        content12: 'L12',
        content13: 'L13',
        content14: 'L14',
        content15: 'L15',
        content16: 'L16',
        content17: 'L17',
        content18: 'L18',
        content19: 'L19',
        content20: 'L20',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual([
        'L1',
        'L2',
        'L3',
        'L4',
        'L5',
        'L6',
        'L7',
        'L8',
        'L9',
        'L10',
        'L11',
        'L12',
        'L13',
        'L14',
        'L15',
        'L16',
        'L17',
        'L18',
        'L19',
        'L20',
      ]);
    });

    it('should populate answers for Dictation type with contentlength up to 30', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 30,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
        content11: 'L11',
        content12: 'L12',
        content13: 'L13',
        content14: 'L14',
        content15: 'L15',
        content16: 'L16',
        content17: 'L17',
        content18: 'L18',
        content19: 'L19',
        content20: 'L20',
        content21: 'L21',
        content22: 'L22',
        content23: 'L23',
        content24: 'L24',
        content25: 'L25',
        content26: 'L26',
        content27: 'L27',
        content28: 'L28',
        content29: 'L29',
        content30: 'L30',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual([
        'L1',
        'L2',
        'L3',
        'L4',
        'L5',
        'L6',
        'L7',
        'L8',
        'L9',
        'L10',
        'L11',
        'L12',
        'L13',
        'L14',
        'L15',
        'L16',
        'L17',
        'L18',
        'L19',
        'L20',
        'L21',
        'L22',
        'L23',
        'L24',
        'L25',
        'L26',
        'L27',
        'L28',
        'L29',
        'L30',
      ]);
    });

    it('should populate answers for Dictation type with contentlength up to 39 (maximum)', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 39,
        content1: 'L1',
        content2: 'L2',
        content3: 'L3',
        content4: 'L4',
        content5: 'L5',
        content6: 'L6',
        content7: 'L7',
        content8: 'L8',
        content9: 'L9',
        content10: 'L10',
        content11: 'L11',
        content12: 'L12',
        content13: 'L13',
        content14: 'L14',
        content15: 'L15',
        content16: 'L16',
        content17: 'L17',
        content18: 'L18',
        content19: 'L19',
        content20: 'L20',
        content21: 'L21',
        content22: 'L22',
        content23: 'L23',
        content24: 'L24',
        content25: 'L25',
        content26: 'L26',
        content27: 'L27',
        content28: 'L28',
        content29: 'L29',
        content30: 'L30',
        content31: 'L31',
        content32: 'L32',
        content33: 'L33',
        content34: 'L34',
        content35: 'L35',
        content36: 'L36',
        content37: 'L37',
        content38: 'L38',
        content39: 'L39',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual([
        'L1',
        'L2',
        'L3',
        'L4',
        'L5',
        'L6',
        'L7',
        'L8',
        'L9',
        'L10',
        'L11',
        'L12',
        'L13',
        'L14',
        'L15',
        'L16',
        'L17',
        'L18',
        'L19',
        'L20',
        'L21',
        'L22',
        'L23',
        'L24',
        'L25',
        'L26',
        'L27',
        'L28',
        'L29',
        'L30',
        'L31',
        'L32',
        'L33',
        'L34',
        'L35',
        'L36',
        'L37',
        'L38',
        'L39',
      ]);
    });

    // Test specific content field boundaries for answers
    it('should populate answers for contentlength 6', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 6,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    });

    it('should populate answers for contentlength 7', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 7,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
        content7: 'G',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('should populate answers for contentlength 8', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 8,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
        content7: 'G',
        content8: 'H',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    });

    it('should populate answers for contentlength 9', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 9,
        content1: 'A',
        content2: 'B',
        content3: 'C',
        content4: 'D',
        content5: 'E',
        content6: 'F',
        content7: 'G',
        content8: 'H',
        content9: 'I',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
    });

    // Test edge case: contentlength is 0
    it('should handle contentlength of 0 with content fallback', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        author: 'Author',
        contentlength: 0,
        content: 'Fallback content',
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual(['Fallback content']);
    });

    // Test edge case: contentlength is 0 without content
    it('should handle contentlength of 0 without content', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
        contentlength: 0,
      };
      const result = convertChineseReciteItemToKnowledge([item]);
      expect(result[0].answers).toEqual([]);
    });

    // Test FillInTheBlank with undefined content
    it('should handle FillInTheBlank with undefined content', () => {
      const item: LearnChineseFileItem = {
        subject: 'Test',
      };
      const result = convertChineseReciteItemToKnowledge([item], 2);
      expect(result[0].question).toBe('Test. undefined');
    });
  });
});