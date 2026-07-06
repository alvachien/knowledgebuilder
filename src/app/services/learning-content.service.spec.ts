import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type {
  EnglishListeningLesson,
  FormulaReciteContent,
  KnowledgeExerciseFileContent,
  LearnChineseFileItem,
  LearnEnglishSentFileItem,
  LearnEnglishWordFileItem,
  LearningContent,
  QuestionBankItemCombinedInterface,
} from '../interfaces';
import { QuestionBankTypeEnum } from '../interfaces';

import { LearningContentService } from './learning-content.service';

const API_URL = 'https://localhost:7135/api/LearningContents';
const STORAGE_URL = 'https://localhost:7135/api/Storage';

const mockVocabularyContents: LearningContent[] = [
  {
    id: 1,
    categoryId: 1,
    nameChinese: 'CET-4 词汇',
    nameEnglish: 'CET-4 Vocabulary',
    fileUrl: 'storage/learnenglish/cet4.json',
    version: 1,
    includeLatex: false,
    translationDisabled: false,
  },
  {
    id: 2,
    categoryId: 1,
    nameChinese: 'CET-6 词汇',
    nameEnglish: 'CET-6 Vocabulary',
    fileUrl: 'storage/learnenglish/cet6.json',
    version: 1,
    includeLatex: false,
    translationDisabled: false,
  },
];

const mockWordItems: LearnEnglishWordFileItem[] = [
  { id: 1, enword: 'apple', cnword: '苹果' },
  { id: 2, enword: 'ab', cnword: 'AB' }, // length 2 — kept (> 1)
  { id: 3, enword: 'a', cnword: '啊' }, // length 1 — filtered
  { id: 4, enword: '', cnword: '空' }, // empty — filtered
];

const mockSentenceItems: LearnEnglishSentFileItem[] = [
  { id: '1', ensent: 'Hello world', cnsent: '你好世界' },
  { id: '2', ensent: 'Hi', cnsent: '嗨' }, // length 2 — kept (> 1)
  { id: '3', ensent: 'A', cnsent: '啊' }, // length 1 — filtered
  { id: '4', ensent: '', cnsent: '空' }, // empty — filtered
];

const mockChineseItems: LearnChineseFileItem[] = [
  { id: 1, subject: '静夜思', author: '李白', content: '床前明月光' },
  { id: 2, subject: '春晓', author: '孟浩然', content: '春眠不觉晓' },
];

const mockListeningItems: EnglishListeningLesson[] = [
  { title: 'Lesson 1', audioFile: 'lesson1.mp3', sections: [] },
  { title: 'Lesson 2', audioFile: 'lesson2.mp3', sections: [] },
];

const mockFormulaItems: FormulaReciteContent[] = [
  { name: '勾股定理', value: 'a^2 + b^2 = c^2', math: true, source: '几何' },
  { name: '平方差公式', value: 'a^2 - b^2 = (a+b)(a-b)', math: true },
];

// Raw JSON items returned by the Storage API for knowledge exercises.
const mockKnowledgeItems: QuestionBankItemCombinedInterface[] = [
  {
    id: 'q1',
    order: 1,
    itemType: QuestionBankTypeEnum.SingleChoice,
    question: '1 + 1 = ?',
    options: { A: '1', B: '2' },
    answer: 'B',
  },
  {
    id: 'q2',
    order: 2,
    itemType: QuestionBankTypeEnum.SingleChoice,
    question: 'No answer provided',
    options: { A: '1', B: '2' },
  },
  {
    id: 'q3',
    order: 3,
    itemType: QuestionBankTypeEnum.FillInTheBlank,
    question: 'Fill in the @blank@',
  },
  {
    id: 'q4',
    order: 4,
    itemType: QuestionBankTypeEnum.TrueFalse,
    // no question — must be filtered out
  },
];

describe('LearningContentService', () => {
  let service: LearningContentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LearningContentService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LearningContentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStorageFileUrl', () => {
    it('should strip the "storage/" prefix and build the Storage API URL', () => {
      expect(service.getStorageFileUrl('storage/learnenglish/cet4.json')).toBe(
        `${STORAGE_URL}/learnenglish/cet4.json`
      );
    });

    it('should build the Storage API URL when the prefix is absent', () => {
      expect(service.getStorageFileUrl('learnenglish/cet4.json')).toBe(
        `${STORAGE_URL}/learnenglish/cet4.json`
      );
    });
  });

  describe('getStorageFileBaseUrl', () => {
    it('should return the directory URL with a trailing slash', () => {
      expect(service.getStorageFileBaseUrl('storage/knowledge-exercises/data.json')).toBe(
        `${STORAGE_URL}/knowledge-exercises/`
      );
    });

    it('should preserve nested directories before the filename', () => {
      expect(service.getStorageFileBaseUrl('storage/learnenglish/sub/cet4.json')).toBe(
        `${STORAGE_URL}/learnenglish/sub/`
      );
    });
  });

  describe('getContentsByCategory', () => {
    it('should fetch contents with the categoryId query param', () => {
      service.getContentsByCategory(1).subscribe(contents => {
        expect(contents).toEqual(mockVocabularyContents);
      });
      httpMock.expectOne(`${API_URL}?categoryId=1`).flush(mockVocabularyContents);
    });

    it('should cache contents per category on subsequent calls', () => {
      service.getContentsByCategory(1).subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=1`).flush(mockVocabularyContents);

      // Second call returns from cache — no HTTP request expected
      service.getContentsByCategory(1).subscribe(contents => {
        expect(contents).toEqual(mockVocabularyContents);
      });
    });

    it('should cache each category independently', () => {
      service.getContentsByCategory(1).subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=1`).flush(mockVocabularyContents);

      const sentenceContents: LearningContent[] = [
        {
          id: 10,
          categoryId: 2,
          nameChinese: '句子',
          nameEnglish: 'Sentences',
          fileUrl: 'storage/learnenglish/sentences.json',
        },
      ];
      service.getContentsByCategory(2).subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=2`).flush(sentenceContents);

      // Both come from cache now — no further HTTP
      service.getContentsByCategory(1).subscribe(contents => expect(contents).toBe(mockVocabularyContents));
      service.getContentsByCategory(2).subscribe(contents => expect(contents).toBe(sentenceContents));
    });
  });

  describe('category list helpers', () => {
    it('should delegate each helper to the correct category id', () => {
      service.getVocabularyContents().subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=1`).flush(mockVocabularyContents);

      service.getSentenceContents().subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=2`).flush(mockVocabularyContents);

      service.getListeningContents().subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=3`).flush(mockVocabularyContents);

      service.getChineseContents().subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=4`).flush(mockVocabularyContents);

      service.getFormulaContents().subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=5`).flush(mockVocabularyContents);

      service.getKnowledgeBankContents().subscribe();
      httpMock.expectOne(`${API_URL}?categoryId=6`).flush(mockVocabularyContents);
    });
  });

  describe('getVocabularyWordContent', () => {
    const fileUrl = 'storage/learnenglish/cet4.json';
    const storageFileUrl = `${STORAGE_URL}/learnenglish/cet4.json`;

    it('should fetch via the Storage API and filter out words with enword length <= 1', () => {
      service.getVocabularyWordContent(fileUrl).subscribe(items => {
        expect(items.length).toBe(2);
        expect(items.map(i => i.enword)).toEqual(['apple', 'ab']);
        expect(items.every(item => item.enword.length > 1)).toBe(true);
      });
      httpMock.expectOne(storageFileUrl).flush(mockWordItems);
    });

    it('should cache the filtered words per fileUrl', () => {
      service.getVocabularyWordContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(mockWordItems);

      // Second call returns from cache — no HTTP request expected
      service.getVocabularyWordContent(fileUrl).subscribe(items => {
        expect(items.length).toBe(2);
      });
    });
  });

  describe('getSentenceFileContent', () => {
    const fileUrl = 'storage/learnenglish/sentences.json';
    const storageFileUrl = `${STORAGE_URL}/learnenglish/sentences.json`;

    it('should fetch via the Storage API and filter out sentences with ensent length <= 1', () => {
      service.getSentenceFileContent(fileUrl).subscribe(items => {
        expect(items.length).toBe(2);
        expect(items.map(i => i.ensent)).toEqual(['Hello world', 'Hi']);
      });
      httpMock.expectOne(storageFileUrl).flush(mockSentenceItems);
    });

    it('should cache the filtered sentences per fileUrl', () => {
      service.getSentenceFileContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(mockSentenceItems);

      service.getSentenceFileContent(fileUrl).subscribe(items => {
        expect(items.length).toBe(2);
      });
    });
  });

  describe('getChineseFileContent', () => {
    const fileUrl = 'storage/learnchinese/juniorschool.json';
    const storageFileUrl = `${STORAGE_URL}/learnchinese/juniorschool.json`;

    it('should fetch via the Storage API and cache the items', () => {
      service.getChineseFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual(mockChineseItems);
      });
      httpMock.expectOne(storageFileUrl).flush(mockChineseItems);
    });

    it('should cache per fileUrl', () => {
      service.getChineseFileContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(mockChineseItems);

      service.getChineseFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual(mockChineseItems);
      });
    });

    it('should coerce a null response to an empty array in the cache', () => {
      service.getChineseFileContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(null);

      // Second call returns the coerced empty array from cache — no HTTP
      service.getChineseFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual([]);
      });
    });
  });

  describe('getListeningFileContent', () => {
    const fileUrl = 'storage/englishlistening/ltt1.json';
    const storageFileUrl = `${STORAGE_URL}/englishlistening/ltt1.json`;

    it('should fetch via the Storage API and cache the lessons', () => {
      service.getListeningFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual(mockListeningItems);
      });
      httpMock.expectOne(storageFileUrl).flush(mockListeningItems);
    });

    it('should cache per fileUrl', () => {
      service.getListeningFileContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(mockListeningItems);

      service.getListeningFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual(mockListeningItems);
      });
    });
  });

  describe('getFormulaFileContent', () => {
    const fileUrl = 'storage/formula/highschoolmath.json';
    const storageFileUrl = `${STORAGE_URL}/formula/highschoolmath.json`;

    it('should fetch via the Storage API and cache the formulas', () => {
      service.getFormulaFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual(mockFormulaItems);
      });
      httpMock.expectOne(storageFileUrl).flush(mockFormulaItems);
    });

    it('should cache per fileUrl', () => {
      service.getFormulaFileContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(mockFormulaItems);

      service.getFormulaFileContent(fileUrl).subscribe(items => {
        expect(items).toEqual(mockFormulaItems);
      });
    });
  });

  describe('getKnowledgeExerciseContent', () => {
    const fileUrl = 'storage/knowledge-exercises/data.json';
    const storageFileUrl = `${STORAGE_URL}/knowledge-exercises/data.json`;

    it('should map items to KnowledgeExerciseFileContent with itemTypeString and hasAnswer, filtering out items without a question', () => {
      service.getKnowledgeExerciseContent(fileUrl).subscribe(items => {
        // q4 has no question → filtered out; 3 items remain
        expect(items.length).toBe(3);

        const [q1, q2, q3] = items as KnowledgeExerciseFileContent[];
        expect(q1.id).toBe('q1');
        expect(q1.itemTypeString).toBe('单选题');
        expect(q1.hasAnswer).toBe(true); // has answer 'B'

        expect(q2.id).toBe('q2');
        expect(q2.itemTypeString).toBe('单选题');
        expect(q2.hasAnswer).toBe(false); // no answer

        expect(q3.id).toBe('q3');
        expect(q3.itemTypeString).toBe('填空题');
        expect(q3.hasAnswer).toBe(true); // FillInTheBlank always has an answer
      });
      httpMock.expectOne(storageFileUrl).flush(mockKnowledgeItems);
    });

    it('should cache the mapped items per fileUrl', () => {
      service.getKnowledgeExerciseContent(fileUrl).subscribe();
      httpMock.expectOne(storageFileUrl).flush(mockKnowledgeItems);

      service.getKnowledgeExerciseContent(fileUrl).subscribe(items => {
        expect(items.length).toBe(3);
      });
    });
  });

  describe('addTemporaryContent', () => {
    it('should register filtered words in the vocabulary cache without an HTTP request', () => {
      const fileUrl = 'storage/learnenglish/uploaded.json';
      const items: LearnEnglishWordFileItem[] = [
        { id: 1, enword: 'apple', cnword: '苹果' },
        { id: 2, enword: 'a', cnword: '啊' }, // length 1 — filtered
      ];

      service.addTemporaryContent(fileUrl, items);

      // Must come from cache — no HTTP request expected
      service.getVocabularyWordContent(fileUrl).subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].enword).toBe('apple');
      });
    });
  });
});
