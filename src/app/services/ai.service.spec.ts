import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { environment } from '../../environments/environment';

import { AIService } from './ai.service';
import { UserCodeService } from './user-code.service';

describe('AIService', () => {
  let service: AIService;
  let httpTestingController: HttpTestingController;
  let mockUserCodeService: { isUserCodeEntered: boolean; getUserCode: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    const userCodeSpy = { isUserCodeEntered: false, getUserCode: vi.fn() };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AIService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: UserCodeService, useValue: userCodeSpy },
      ],
    });

    service = TestBed.inject(AIService);
    httpTestingController = TestBed.inject(HttpTestingController);
    mockUserCodeService = TestBed.inject(UserCodeService) as any;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTTS', () => {
    it('should return error if user code is not entered', async () => {
      Object.defineProperty(mockUserCodeService, 'isUserCodeEntered', {
        get: () => false,
      });

      await expect(firstValueFrom(service.getTTS('hello world'))).rejects.toThrow('Data file is not found!');
    });

    it('should make GET request to TTS endpoint when user code is entered', () => {
      Object.defineProperty(mockUserCodeService, 'isUserCodeEntered', {
        get: () => true,
      });

      service.getTTS('hello world').subscribe(response => {
        expect(response).toEqual({ data: 'tts-response' });
      });

      const req = httpTestingController.expectOne(r =>
        r.url === `${environment.apiUrl}/api/TTS/details` &&
        r.params.get('sentence') === 'hello world'
      );
      expect(req.request.method).toBe('GET');

      req.flush({ data: 'tts-response' });
    });
  });

  describe('explainSentence', () => {
    it('should return error if user code is not entered', async () => {
      Object.defineProperty(mockUserCodeService, 'isUserCodeEntered', {
        get: () => false,
      });

      await expect(firstValueFrom(service.explainSentence('test'))).rejects.toThrow('Data file is not found!');
    });

    it('should make GET request to explain sentence endpoint', () => {
      Object.defineProperty(mockUserCodeService, 'isUserCodeEntered', {
        get: () => true,
      });

      service.explainSentence('this is a test').subscribe(response => {
        expect(response).toEqual({ explanation: 'sentence explanation' });
      });

      const req = httpTestingController.expectOne(r =>
        r.url === `${environment.apiUrl}/api/EnglishLLM/details` &&
        r.params.get('sentence') === 'this is a test'
      );
      expect(req.request.method).toBe('GET');

      req.flush({ explanation: 'sentence explanation' });
    });
  });

  describe('explainFormat', () => {
    it('should return error if user code is not entered', async () => {
      Object.defineProperty(mockUserCodeService, 'isUserCodeEntered', {
        get: () => false,
      });

      await expect(firstValueFrom(service.explainFormat('math', 'E=mc2'))).rejects.toThrow('Data file is not found!');
    });

    it('should make POST request to explain format endpoint', () => {
      Object.defineProperty(mockUserCodeService, 'isUserCodeEntered', {
        get: () => true,
      });

      service.explainFormat('math', 'E=mc2').subscribe(response => {
        expect(response).toEqual({ content: 'math explanation' });
      });

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/api/FormatLLM/AskAnything`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        formattype: 'math',
        context: 'E=mc2',
      });

      req.flush({ content: 'math explanation' });
    });
  });
});
