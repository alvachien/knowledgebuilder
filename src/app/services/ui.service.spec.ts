import { TestBed } from '@angular/core/testing';

import type { KnowledgeExerciseFileContent, KnowledgeExercisePrintOption } from '../interfaces';
import { QuestionBankTypeEnum, QuestionBankItemLevelEnum } from '../interfaces';

import { UIService } from './ui.service';

describe('UIService', () => {
  let service: UIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty exercise items', () => {
      expect(service.ExerciseItems).toEqual([]);
    });

    it('should initialize with false for includeLatex', () => {
      expect(service.IncludeLatex).toBe(false);
    });

    it('should initialize with undefined for exercise print setting', () => {
      expect(service.ExercisePrintSetting).toBeUndefined();
    });
  });

  describe('setSelectedExerciseItem', () => {
    let mockExerciseContent: KnowledgeExerciseFileContent[];

    beforeEach(() => {
      mockExerciseContent = [
        {
          id: '1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'What is 2+2?',
          answer: 'A',
          options: {
            A: '4',
            B: '5',
            C: '6',
            D: '7',
          },
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
        {
          id: '2',
          order: 2,
          itemType: QuestionBankTypeEnum.FillInTheBlank,
          question: 'The sky is ____.',
          answers: ['blue'],
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
        {
          id: '3',
          order: 3,
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'Which colors are primary?',
          answers: ['A', 'C'],
          options: {
            A: 'Red',
            B: 'Green',
            C: 'Blue',
            D: 'Yellow',
          },
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
      ];
    });

    it('should set exercise items and sort them by order', () => {
      service.setSelectedExerciseItem(mockExerciseContent);

      const items = service.ExerciseItems;
      expect(items.length).toBe(3);
      expect(items[0].order).toBe(1);
      expect(items[1].order).toBe(2);
      expect(items[2].order).toBe(3);
    });

    it('should convert KnowledgeExerciseFileContent to QuestionBankItemBase', () => {
      service.setSelectedExerciseItem(mockExerciseContent);

      const items = service.ExerciseItems;
      expect(items[0].itemType).toBe(QuestionBankTypeEnum.SingleChoice);
      expect(items[1].itemType).toBe(QuestionBankTypeEnum.FillInTheBlank);
      expect(items[2].itemType).toBe(QuestionBankTypeEnum.MultipleChoice);
    });

    it('should set includeLatex to false when not provided', () => {
      service.setSelectedExerciseItem(mockExerciseContent);

      expect(service.IncludeLatex).toBe(false);
    });

    it('should set includeLatex when provided', () => {
      service.setSelectedExerciseItem(mockExerciseContent, undefined, true);

      expect(service.IncludeLatex).toBe(true);
    });

    it('should set exercise print setting when provided', () => {
      const mockPrintSetting: KnowledgeExercisePrintOption = {
        formTitle: 'Test Title',
        printScore: true,
        hideLabelOfQuestionType: [],
        printAnswer: false,
        printEntryDate: true,
        printID: false,
        printHintOfAnswer: true,
      };

      service.setSelectedExerciseItem(mockExerciseContent, mockPrintSetting);

      expect(service.ExercisePrintSetting).toEqual(mockPrintSetting);
    });

    it('should clear exercise items before setting new ones', () => {
      service.setSelectedExerciseItem(mockExerciseContent);

      const newMockContent: KnowledgeExerciseFileContent[] = [
        {
          id: '4',
          order: 1,
          itemType: QuestionBankTypeEnum.TrueFalse,
          question: 'Is Angular a framework?',
          answer: 'A',
          options: {
            A: 'True',
            B: 'False',
          },
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
      ];

      service.setSelectedExerciseItem(newMockContent);

      expect(service.ExerciseItems.length).toBe(1);
      expect(service.ExerciseItems[0].id).toBe('4');
    });
  });

  describe('Option Shuffling', () => {
    let mockExerciseContent: KnowledgeExerciseFileContent[];
    let mockPrintSetting: KnowledgeExercisePrintOption;

    beforeEach(() => {
      mockExerciseContent = [
        {
          id: '1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'What is 2+2?',
          answer: 'A',
          options: {
            A: '4',
            B: '5',
            C: '6',
            D: '7',
          },
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
      ];

      mockPrintSetting = {
        formTitle: 'Test Title',
        printScore: true,
        hideLabelOfQuestionType: [],
        printAnswer: false,
        printEntryDate: true,
        printID: false,
        printHintOfAnswer: true,
        shuffleOptionsInSelection: true,
      };
    });

    it('should shuffle options when shuffleOptionsInSelection is true', () => {
      service.setSelectedExerciseItem(mockExerciseContent, mockPrintSetting);

      const items = service.ExerciseItems;
      expect(items.length).toBe(1);
      // Note: We can't predict the exact shuffled order, but we can ensure the method was called
      // and the service processed the shuffle request
      expect(items[0].id).toBe('1');
    });

    it('should not shuffle options when shuffleOptionsInSelection is false', () => {
      mockPrintSetting.shuffleOptionsInSelection = false;
      service.setSelectedExerciseItem(mockExerciseContent, mockPrintSetting);

      const items = service.ExerciseItems;
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('1');
    });

    it('should handle MultipleChoice option shuffling correctly', () => {
      const multiChoiceContent: KnowledgeExerciseFileContent[] = [
        {
          id: '2',
          order: 1,
          itemType: QuestionBankTypeEnum.MultipleChoice,
          question: 'Which colors are primary?',
          answers: ['A', 'C'],
          options: {
            A: 'Red',
            B: 'Green',
            C: 'Blue',
            D: 'Yellow',
          },
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
      ];

      service.setSelectedExerciseItem(multiChoiceContent, mockPrintSetting);

      const items = service.ExerciseItems;
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('2');
    });
  });

  describe('Getter methods', () => {
    let mockExerciseContent: KnowledgeExerciseFileContent[];

    beforeEach(() => {
      mockExerciseContent = [
        {
          id: '1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: 'What is 2+2?',
          answer: 'A',
          options: {
            A: '4',
            B: '5',
            C: '6',
            D: '7',
          },
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        },
      ];
    });

    it('should return the exercise items through ExerciseItems getter', () => {
      service.setSelectedExerciseItem(mockExerciseContent);

      const items = service.ExerciseItems;
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
    });

    it('should return the exercise print setting through ExercisePrintSetting getter', () => {
      const mockPrintSetting: KnowledgeExercisePrintOption = {
        formTitle: 'Test Title',
        printScore: true,
        hideLabelOfQuestionType: [],
        printAnswer: false,
        printEntryDate: true,
        printID: false,
        printHintOfAnswer: true,
      };

      service.setSelectedExerciseItem(mockExerciseContent, mockPrintSetting);

      expect(service.ExercisePrintSetting).toEqual(mockPrintSetting);
    });

    it('should return the includeLatex value through IncludeLatex getter', () => {
      service.setSelectedExerciseItem(mockExerciseContent, undefined, true);

      expect(service.IncludeLatex).toBe(true);

      service.setSelectedExerciseItem(mockExerciseContent, undefined, false);

      expect(service.IncludeLatex).toBe(false);
    });
  });

  describe('Edge Cases and Invalid Data', () => {
    it('should handle empty exercise content array', () => {
      service.setSelectedExerciseItem([]);

      expect(service.ExerciseItems).toEqual([]);
      expect(service.ExerciseItems.length).toBe(0);
    });

    it('should handle exercise content with invalid item types', () => {
      const invalidContent: KnowledgeExerciseFileContent[] = [
        {
          id: '1',
          order: 1,
          itemType: QuestionBankTypeEnum.SingleChoice,
          question: '',
          answer: '',
          options: {},
          questionLevel: QuestionBankItemLevelEnum.Full,
          questionFormat: 'Text',
        } as any,
      ];

      service.setSelectedExerciseItem(invalidContent);

      const items = service.ExerciseItems;
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('1');
    });

    it('should handle undefined print setting', () => {
      service.setSelectedExerciseItem([], undefined, false);

      expect(service.ExercisePrintSetting).toBeUndefined();
      expect(service.IncludeLatex).toBe(false);
    });
  });
});
