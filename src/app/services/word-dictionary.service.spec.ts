import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import type { WordDictionaryEntry } from '../interfaces';

import { WordDictionaryService } from './word-dictionary.service';

describe('WordDictionaryService', () => {
  let service: WordDictionaryService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/WordDictionary`;

  const entry = (word: string): WordDictionaryEntry => ({
    word,
    definitions: [{ partOfSpeech: 'n.', meaning: '测试' }],
    examples: [{ source: `This is ${word}.`, translation: '这是测试。' }],
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WordDictionaryService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WordDictionaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET with the lowercased word as the only param', () => {
    let result: WordDictionaryEntry | null | undefined;

    service.getWord('Hello').subscribe(value => (result = value));

    const req = httpMock.expectOne(`${apiUrl}?word=hello`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual(['word']);
    const response = entry('hello');
    req.flush(response);

    expect(result).toEqual(response);
  });

  it('should cache entries - a second call for the same word makes no request', () => {
    const response = entry('hello');
    service.getWord('hello').subscribe(r => r);
    httpMock.expectOne(`${apiUrl}?word=hello`).flush(response);

    let second: WordDictionaryEntry | null | undefined;
    service.getWord('Hello').subscribe(value => (second = value));

    expect(second).toEqual(response);
    httpMock.verify();
  });

  it('should emit null and cache the miss on 404 (unknown word)', () => {
    let result: WordDictionaryEntry | null | undefined = { word: 'x', definitions: [], examples: [] };

    service.getWord('ghostword').subscribe(value => (result = value));
    httpMock.expectOne(`${apiUrl}?word=ghostword`).flush('', { status: 404, statusText: 'Not Found' });
    expect(result).toBeNull();

    // The miss is cached: no second request for the same word.
    let second: WordDictionaryEntry | null | undefined;
    service.getWord('ghostword').subscribe(value => (second = value));
    expect(second).toBeNull();
    httpMock.verify();
  });

  it('should emit null on a transient failure and NOT cache it (a re-request goes out)', () => {
    service.getWord('hello').subscribe();
    httpMock.expectOne(`${apiUrl}?word=hello`).flush('', { status: 500, statusText: 'Server Error' });

    // A 5xx blip must not poison the session the way a true 404 miss may.
    let second: WordDictionaryEntry | null | undefined;
    service.getWord('hello').subscribe(value => (second = value));
    const response = entry('hello');
    httpMock.expectOne(`${apiUrl}?word=hello`).flush(response);

    expect(second).toEqual(response);
  });

  it('should emit null without a request for a blank word', () => {
    let result: WordDictionaryEntry | null | undefined = { word: 'x', definitions: [], examples: [] };

    service.getWord('   ').subscribe(value => (result = value));

    expect(result).toBeNull();
    httpMock.verify();
  });
});
