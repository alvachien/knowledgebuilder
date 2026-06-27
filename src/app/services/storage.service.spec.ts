import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { environment } from '../../environments/environment';

import type {
  LearnChineseDataFile,
  LearnChineseFileItem,
  LearnEnglishWordDataFile,
  LearnEnglishWordFileItem,
  LearnEnglishSentDataFile,
  LearnEnglishSentFileItem,
  FormulaReciteDataFile,
  FormulaReciteContent,
  EnglishListeningFile,
  EnglishListeningLesson,
  KnowledgeExerciseFile,
} from '../interfaces';
import { QuestionBankTypeEnum } from '../interfaces';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let httpClientSpy: { get: ReturnType<typeof vi.fn> };

  const mockLearnChineseData: LearnChineseDataFile[] = [
    { name: 'tangshi', file: 'tangshi300.json', version: 1 },
    { name: 'songshi', file: 'songshi.json', version: 1 },
  ];

  const mockLearnEnglishWordData: LearnEnglishWordDataFile[] = [
    { name: 'cet4', file: 'cet4.json' },
    { name: 'toefl', file: 'toefl.json' },
  ];

  const mockLearnEnglishSentData: LearnEnglishSentDataFile[] = [
    { name: 'cet4_sent', file: 'cet4_sent.json' },
  ];

  const mockFormulaData: FormulaReciteDataFile[] = [
    { name: 'math', file: 'math002.json' },
    { name: 'physics', file: 'physics002.json' },
  ];

  const mockEnglishListeningData: EnglishListeningFile[] = [
    { book: 'ltt1', file: 'ltt1.json' },
    { book: 'ltt2', file: 'ltt2.json' },
  ];

  const mockKnowledgeExerciseData: KnowledgeExerciseFile[] = [
    { name: 'grammar', file: 'grammar.json' },
    { name: 'reading', file: 'reading.json' },
  ];

  beforeEach(() => {
    const httpClientSpyObj = { get: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [StorageService, { provide: HttpClient, useValue: httpClientSpyObj }],
    });

    service = TestBed.inject(StorageService);
    httpClientSpy = TestBed.inject(HttpClient) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Learn Chinese Data', () => {
    it('should load learn Chinese data file from HTTP', async () => {
      httpClientSpy.get.mockReturnValue(of(mockLearnChineseData));

      const data = await firstValueFrom(service.getLearnChineseDataFile());
      expect(data).toEqual(mockLearnChineseData);
      expect(data.length).toBe(2);
      expect(httpClientSpy.get).toHaveBeenCalledWith('data/learnchinese/data.json');
    });
  });

  describe('Learn English Word Data', () => {
    it('should load learn English word data file from HTTP', async () => {
      httpClientSpy.get.mockReturnValue(of(mockLearnEnglishWordData));

      const data = await firstValueFrom(service.getLearnEnglishWordDataFile());
      expect(data).toEqual(mockLearnEnglishWordData);
      expect(data.length).toBe(2);
      expect(httpClientSpy.get).toHaveBeenCalledWith('data/learnenglish/words.json');
    });
  });

  describe('Learn English Sentence Data', () => {
    it('should load learn English sentence data file from HTTP', async () => {
      httpClientSpy.get.mockReturnValue(of(mockLearnEnglishSentData));

      const data = await firstValueFrom(service.getLearnEnglishSentDataFile());
      expect(data).toEqual(mockLearnEnglishSentData);
      expect(data.length).toBe(1);
      expect(httpClientSpy.get).toHaveBeenCalledWith('data/learnenglish/sentences.json');
    });
  });

  describe('Formula Recitation Data', () => {
    it('should load formula data file from HTTP', async () => {
      httpClientSpy.get.mockReturnValue(of(mockFormulaData));

      const data = await firstValueFrom(service.getFormulaDataFile());
      expect(data).toEqual(mockFormulaData);
      expect(data.length).toBe(2);
      expect(httpClientSpy.get).toHaveBeenCalledWith('data/formula/formula.json');
    });
  });

  describe('English Listening Data', () => {
    it('should load English listening data file from HTTP', async () => {
      httpClientSpy.get.mockReturnValue(of(mockEnglishListeningData));

      const data = await firstValueFrom(service.getEnglishListeningFile());
      expect(data).toEqual(mockEnglishListeningData);
      expect(data.length).toBe(2);
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/api/Storage/englishlistening/data.json`,
      );
    });
  });

  describe('Knowledge Exercise Data', () => {
    it('should load knowledge exercise data file from HTTP', async () => {
      httpClientSpy.get.mockReturnValue(of(mockKnowledgeExerciseData));

      const data = await firstValueFrom(service.getKnowledgeExerciseFile());
      expect(data).toEqual(mockKnowledgeExerciseData);
      expect(data.length).toBe(2);
      expect(httpClientSpy.get).toHaveBeenCalledWith('data/knowledge-exercises/data.json');
    });
  });

  describe('Learn Chinese File Content', () => {
    const mockChineseFileContent: LearnChineseFileItem[] = [
      { content: '床前明月光', subject: '静夜思' },
      { content: '疑是地上霜', subject: '静夜思' },
    ];

    it('should load learn Chinese file content from HTTP when not cached', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnchinese/data.json') return of(mockLearnChineseData);
        if (url === 'data/learnchinese/tangshi300.json') return of(mockChineseFileContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnChineseDataFile());
      const data = await firstValueFrom(service.getLearnChineseFileContent('tangshi'));
      expect(data).toEqual(mockChineseFileContent);
    });

    it('should return cached learn Chinese file content when available', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnchinese/data.json') return of(mockLearnChineseData);
        if (url === 'data/learnchinese/tangshi300.json') return of(mockChineseFileContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnChineseDataFile());
      await firstValueFrom(service.getLearnChineseFileContent('tangshi'));
      const data = await firstValueFrom(service.getLearnChineseFileContent('tangshi'));
      expect(data).toEqual(mockChineseFileContent);
      expect(httpClientSpy.get.mock.calls.length).toBe(2);
    });

    it('should throw error if data file not found for Chinese content', async () => {
      await expect(firstValueFrom(service.getLearnChineseFileContent('nonexistent'))).rejects.toThrow('Data file is not found!');
    });
  });

  describe('Learn English Word File Content', () => {
    const mockEnglishWordContent: LearnEnglishWordFileItem[] = [
      { enword: 'hello', cnword: '你好' },
      { enword: 'world', cnword: '世界' },
    ];

    it('should load learn English word file content from HTTP when not cached', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnenglish/words.json') return of(mockLearnEnglishWordData);
        if (url === 'data/learnenglish/cet4.json') return of(mockEnglishWordContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnEnglishWordDataFile());
      const data = await firstValueFrom(service.getLearnEnglishWordFileContent('cet4'));
      expect(data).toEqual(mockEnglishWordContent);
    });

    it('should return cached learn English word file content when available', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnenglish/words.json') return of(mockLearnEnglishWordData);
        if (url === 'data/learnenglish/cet4.json') return of(mockEnglishWordContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnEnglishWordDataFile());
      await firstValueFrom(service.getLearnEnglishWordFileContent('cet4'));
      const data = await firstValueFrom(service.getLearnEnglishWordFileContent('cet4'));
      expect(data).toEqual(mockEnglishWordContent);
      expect(httpClientSpy.get.mock.calls.length).toBe(2);
    });

    it('should filter valid English word items based on length', async () => {
      const rawContent = [
        { enword: 'hi', cnword: '你好' },
        { enword: 'a', cnword: '一' },
        { enword: 'hello', cnword: '你好' },
      ];
      const filteredContent = [
        { enword: 'hi', cnword: '你好' },
        { enword: 'hello', cnword: '你好' },
      ];

      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnenglish/words.json') return of(mockLearnEnglishWordData);
        if (url === 'data/learnenglish/cet4.json') return of(rawContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnEnglishWordDataFile());
      const data = await firstValueFrom(service.getLearnEnglishWordFileContent('cet4'));
      expect(data).toEqual(filteredContent);
      expect(data?.length).toBe(2);
    });

    it('should throw error if data file not found for English word content', async () => {
      await expect(firstValueFrom(service.getLearnEnglishWordFileContent('nonexistent'))).rejects.toThrow('Data file is not found!');
    });
  });

  describe('Learn English Sent File Content', () => {
    const mockEnglishSentContent: LearnEnglishSentFileItem[] = [
      { ensent: 'Hello world', enwords: ['hello', 'world'], cnsent: '你好世界' },
      { ensent: 'Good morning', enwords: ['good'], cnsent: '早上好' },
    ];

    it('should load learn English sent file content from HTTP when not cached', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnenglish/sentences.json') return of(mockLearnEnglishSentData);
        if (url === 'data/learnenglish/cet4_sent.json') return of(mockEnglishSentContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnEnglishSentDataFile());
      const data = await firstValueFrom(service.getLearnEnglishSentFileContent('cet4_sent'));
      expect(data).toEqual(mockEnglishSentContent);
    });

    it('should filter valid English sentence items based on length', async () => {
      const rawContent = [
        { ensent: 'Hi', enwords: ['hi'], cnsent: '你好' },
        { ensent: 'A', enwords: ['a'], cnsent: '一' },
        { ensent: 'Hello world', enwords: ['hello', 'world'], cnsent: '你好世界' },
      ];
      const filteredContent = [
        { ensent: 'Hi', enwords: ['hi'], cnsent: '你好' },
        { ensent: 'Hello world', enwords: ['hello', 'world'], cnsent: '你好世界' },
      ];

      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/learnenglish/sentences.json') return of(mockLearnEnglishSentData);
        if (url === 'data/learnenglish/cet4_sent.json') return of(rawContent);
        return of([]);
      });

      await firstValueFrom(service.getLearnEnglishSentDataFile());
      const data = await firstValueFrom(service.getLearnEnglishSentFileContent('cet4_sent'));
      expect(data).toEqual(filteredContent);
      expect(data?.length).toBe(2);
    });

    it('should throw error if data file not found for English sent content', async () => {
      await expect(firstValueFrom(service.getLearnEnglishSentFileContent('nonexistent'))).rejects.toThrow('Data file is not found!');
    });
  });

  describe('Formula File Content', () => {
    const mockFormulaContent: FormulaReciteContent[] = [
      { name: 'energy', value: 'E=mc²', math: true },
      { name: 'force', value: 'F=ma', math: true },
    ];

    it('should load formula file content from HTTP when not cached', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/formula/formula.json') return of(mockFormulaData);
        if (url === 'data/formula/math002.json') return of(mockFormulaContent);
        return of([]);
      });

      await firstValueFrom(service.getFormulaDataFile());
      const data = await firstValueFrom(service.getFormulaFileContent('math'));
      expect(data).toEqual(mockFormulaContent);
    });

    it('should return cached formula file content when available', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/formula/formula.json') return of(mockFormulaData);
        if (url === 'data/formula/math002.json') return of(mockFormulaContent);
        return of([]);
      });

      await firstValueFrom(service.getFormulaDataFile());
      await firstValueFrom(service.getFormulaFileContent('math'));
      const data = await firstValueFrom(service.getFormulaFileContent('math'));
      expect(data).toEqual(mockFormulaContent);
    });

    it('should throw error if data file not found for formula content', async () => {
      await expect(firstValueFrom(service.getFormulaFileContent('nonexistent'))).rejects.toThrow('Data file is not found!');
    });
  });

  describe('English Listening File Content', () => {
    const mockListeningContent: EnglishListeningLesson[] = [
      { title: 'Lesson 1', audioFile: 'lesson1.mp3', sections: [] },
      { title: 'Lesson 2', audioFile: 'lesson2.mp3', sections: [] },
    ];

    it('should load English listening file content from HTTP when not cached', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === `${environment.apiUrl}/api/Storage/englishlistening/data.json`)
          return of(mockEnglishListeningData);
        if (url === `${environment.apiUrl}/api/Storage/englishlistening/ltt1.json`)
          return of(mockListeningContent);
        return of([]);
      });

      await firstValueFrom(service.getEnglishListeningFile());
      const data = await firstValueFrom(service.getEnglishListeningFileContent('ltt1'));
      expect(data).toEqual(mockListeningContent);
    });

    it('should return cached English listening file content when available', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === `${environment.apiUrl}/api/Storage/englishlistening/data.json`)
          return of(mockEnglishListeningData);
        if (url === `${environment.apiUrl}/api/Storage/englishlistening/ltt1.json`)
          return of(mockListeningContent);
        return of([]);
      });

      await firstValueFrom(service.getEnglishListeningFile());
      await firstValueFrom(service.getEnglishListeningFileContent('ltt1'));
      const data = await firstValueFrom(service.getEnglishListeningFileContent('ltt1'));
      expect(data).toEqual(mockListeningContent);
    });

    it('should throw error if data file not found for English listening content', async () => {
      await expect(firstValueFrom(service.getEnglishListeningFileContent('nonexistent'))).rejects.toThrow('Data file is not found!');
    });
  });

  describe('Knowledge Exercise File Content', () => {
    const mockKnowledgeContent = [
      {
        id: 1,
        order: 1,
        itemType: QuestionBankTypeEnum.SingleChoice,
        question: 'What is 2+2?',
        answer: '4',
        options: ['3', '4', '5', '6'],
      },
    ];

    it('should load knowledge exercise file content from HTTP when not cached', async () => {
      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/knowledge-exercises/data.json') return of(mockKnowledgeExerciseData);
        if (url === 'data/knowledge-exercises/grammar.json') return of(mockKnowledgeContent);
        return of([]);
      });

      await firstValueFrom(service.getKnowledgeExerciseFile());
      const data = await firstValueFrom(service.getKnowledgeExerciseFileContent('grammar'));
      expect(data?.length).toBe(1);
      expect(data?.[0].question).toBe('What is 2+2?');
    });

    it('should filter knowledge exercise items by question existence', async () => {
      const rawContent = [
        { id: 1, order: 1, itemType: QuestionBankTypeEnum.SingleChoice, question: 'What is 2+2?', answer: '4' },
        { id: 2, order: 2, itemType: QuestionBankTypeEnum.SingleChoice, question: '', answer: 'empty question' },
        { id: 3, order: 3, itemType: QuestionBankTypeEnum.SingleChoice, question: 'What is 3+3?', answer: '6' },
      ];

      httpClientSpy.get.mockImplementation((url: string) => {
        if (url === 'data/knowledge-exercises/data.json') return of(mockKnowledgeExerciseData);
        if (url === 'data/knowledge-exercises/grammar.json') return of(rawContent);
        return of([]);
      });

      await firstValueFrom(service.getKnowledgeExerciseFile());
      const data = await firstValueFrom(service.getKnowledgeExerciseFileContent('grammar'));
      expect(data?.length).toBe(2);
    });

    it('should throw error if data file not found for knowledge exercise content', async () => {
      await expect(firstValueFrom(service.getKnowledgeExerciseFileContent('nonexistent'))).rejects.toThrow('Data file is not found!');
    });
  });

  describe('Temporary File Operations', () => {
    it('should add temporary English word file content', () => {
      const tempContent: LearnEnglishWordFileItem[] = [{ enword: 'temporary', cnword: '临时的' }];

      service.addTemporaryLearnEnglishWordFile('temp_file', tempContent);
    });
  });

  describe('Caching Behavior', () => {
    it('should return cached data when already loaded', async () => {
      httpClientSpy.get.mockReturnValue(of(mockLearnChineseData));

      const firstResult = await firstValueFrom(service.getLearnChineseDataFile());
      expect(firstResult).toEqual(mockLearnChineseData);

      const secondResult = await firstValueFrom(service.getLearnChineseDataFile());
      expect(secondResult).toEqual(mockLearnChineseData);
      expect(httpClientSpy.get.mock.calls.length).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', async () => {
      const error = new Error('Network error');
      httpClientSpy.get.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.getLearnChineseDataFile())).rejects.toThrow(error);
    });
  });
});
