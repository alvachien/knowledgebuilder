import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable} from 'rxjs';
import { map, of, shareReplay, throwError } from 'rxjs';

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
  KnowledgeExerciseFileContent,
  QuestionBankItemCombinedInterface} from '../interfaces';
import {
  getQuestionBankTypeDescription,
  doesQuestionBankItemHasAnswer,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private arLearnChineseDataFile: LearnChineseDataFile[] = [];
  private isLearnChineseDataFileLoaded = false;
  private arLearnEnglishWordDataFile: LearnEnglishWordDataFile[] = [];
  private isLearnEnglishWordDataFileLoaded = false;
  private arLearnEnglishSentDataFile: LearnEnglishSentDataFile[] = [];
  private isLearnEnglishSentDataFileLoaded = false;
  private arFormulaDataFile: FormulaReciteDataFile[] = [];
  private isFormulaDataFileLoaded = false;
  private arEnglishListeningFile: EnglishListeningFile[] = [];
  private isEnglishListeningFileLoaded = false;
  private arKnowledgeExerciseFile: KnowledgeExerciseFile[] = [];
  private isKnowledgeExerciseFileLoaded = false;

  private mapLearnChineseFileContent: Map<string, LearnChineseFileItem[]> = new Map();
  private mapLearnEnglishWordFileContent: Map<string, LearnEnglishWordFileItem[]> = new Map();
  private mapLearnEnglishSentFileContent: Map<string, LearnEnglishSentFileItem[]> = new Map();
  private mapFormulaFileContent: Map<string, FormulaReciteContent[]> = new Map();
  private mapEnglishListeningFileLessons: Map<string, EnglishListeningLesson[]> = new Map();
  private mapKnowledgeExerciseFileContent: Map<string, KnowledgeExerciseFileContent[]> = new Map();

  /** In-flight observables keyed by URL — prevents duplicate HTTP requests for the same resource. */
  private inflightRequests = new Map<string, Observable<unknown>>();

  private http = inject(HttpClient);

  /**
   * Returns a shared observable for the given URL. If a request is already in-flight
   * for that URL, the same observable is returned so multiple subscribers share one HTTP call.
   * `transform` receives the raw response and returns the value to emit and cache.
   * Once the response arrives, the in-flight entry is removed.
   */
  private cachedGet<T, R = T>(url: string, transform: (value: T) => R): Observable<R> {
    const cached = this.inflightRequests.get(url) as Observable<R> | undefined;
    if (cached) {
      return cached;
    }

    const obs$ = this.http.get<T>(url).pipe(
      map(value => transform(value)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.inflightRequests.set(url, obs$);

    // Clean up the in-flight entry after completion so a future call refetches.
    obs$.subscribe({
      error: () => this.inflightRequests.delete(url),
      complete: () => this.inflightRequests.delete(url),
    });

    return obs$;
  }

  constructor() {}

  getLearnChineseDataFile(): Observable<LearnChineseDataFile[]> {
    if (!this.isLearnChineseDataFileLoaded) {
      return this.cachedGet<LearnChineseDataFile[]>('data/learnchinese/data.json', df => {
        this.isLearnChineseDataFileLoaded = true;
        this.arLearnChineseDataFile = df;
        return df;
      });
    }

    return of(this.arLearnChineseDataFile);
  }

  getLearnChineseFileContent(
    name: string
  ): Observable<LearnChineseFileItem[] | undefined> {
    const currentfile = this.arLearnChineseDataFile.find(df => df.name === name);
    if (!currentfile) {
      return throwError(() => new Error('Data file is not found!'));
    }

    if (this.mapLearnChineseFileContent.has(name)) {
      return of(this.mapLearnChineseFileContent.get(name));
    }

    const url = `data/learnchinese/${currentfile.file}`;
    return this.cachedGet<LearnChineseFileItem[], LearnChineseFileItem[]>(url, dfile => {
      this.mapLearnChineseFileContent.set(name, dfile);
      return dfile;
    });
  }

  getLearnEnglishWordDataFile(): Observable<LearnEnglishWordDataFile[]> {
    if (!this.isLearnEnglishWordDataFileLoaded) {
      return this.cachedGet<LearnEnglishWordDataFile[]>('data/learnenglish/words.json', df => {
        this.isLearnEnglishWordDataFileLoaded = true;
        this.arLearnEnglishWordDataFile = df;
        return df;
      });
    }
    return of(this.arLearnEnglishWordDataFile);
  }

  getLearnEnglishWordFileContent(
    name: string
  ): Observable<LearnEnglishWordFileItem[] | undefined> {
    const currentfile = this.arLearnEnglishWordDataFile.find(
      (df) => df.name === name
    );
    if (!currentfile) {
      return throwError(() => new Error('Data file is not found!'));
    }

    if (this.mapLearnEnglishWordFileContent.has(name)) {
      return of(this.mapLearnEnglishWordFileContent.get(name));
    }

    const url = `data/learnenglish/${currentfile.file}`;
    return this.cachedGet<LearnEnglishWordFileItem[], LearnEnglishWordFileItem[]>(url, dfile => {
      const validitems = dfile.filter((item) => item.enword.length > 1);
      this.mapLearnEnglishWordFileContent.set(name, validitems);
      return validitems;
    });
  }

  getLearnEnglishSentDataFile(): Observable<LearnEnglishSentDataFile[]> {
    if (!this.isLearnEnglishSentDataFileLoaded) {
      return this.cachedGet<LearnEnglishSentDataFile[]>('data/learnenglish/sentences.json', df => {
        this.isLearnEnglishSentDataFileLoaded = true;
        this.arLearnEnglishSentDataFile = df;
        return df;
      });
    }
    return of(this.arLearnEnglishSentDataFile);
  }

  getLearnEnglishSentFileContent(
    name: string
  ): Observable<LearnEnglishSentFileItem[] | undefined> {
    const currentfile = this.arLearnEnglishSentDataFile.find(
      (df) => df.name === name
    );
    if (!currentfile) {
      return throwError(() => new Error('Data file is not found!'));
    }

    if (this.mapLearnEnglishSentFileContent.has(name)) {
      return of(this.mapLearnEnglishSentFileContent.get(name));
    }

    const url = `data/learnenglish/${currentfile.file}`;
    return this.cachedGet<LearnEnglishSentFileItem[], LearnEnglishSentFileItem[]>(url, dfile => {
      const validcontent = dfile.filter((item) => item.ensent.length > 1);
      this.mapLearnEnglishSentFileContent.set(name, validcontent);
      return validcontent;
    });
  }

  getFormulaDataFile(): Observable<FormulaReciteDataFile[]> {
    if (!this.isFormulaDataFileLoaded) {
      return this.cachedGet<FormulaReciteDataFile[]>('data/formula/formula.json', df => {
        this.isFormulaDataFileLoaded = true;
        this.arFormulaDataFile = df;
        return df;
      });
    }
    return of(this.arFormulaDataFile);
  }

  getFormulaFileContent(
    name: string
  ): Observable<FormulaReciteContent[] | undefined> {
    const currentfile = this.arFormulaDataFile.find((df) => df.name === name);
    if (!currentfile) {
      return throwError(() => new Error('Data file is not found!'));
    }

    if (this.mapFormulaFileContent.has(name)) {
      return of(this.mapFormulaFileContent.get(name));
    }

    const url = `data/formula/${currentfile.file}`;
    return this.cachedGet<FormulaReciteContent[], FormulaReciteContent[]>(url, dfile => {
      this.mapFormulaFileContent.set(name, dfile);
      return dfile;
    });
  }

  getEnglishListeningFile(): Observable<EnglishListeningFile[]> {
    if (!this.isEnglishListeningFileLoaded) {
      return this.cachedGet<EnglishListeningFile[]>(
        `${environment.apiUrl}/api/Storage/englishlistening/data.json`,
        df => {
          this.isEnglishListeningFileLoaded = true;
          this.arEnglishListeningFile = df;
          return df;
        },
      );
    }
    return of(this.arEnglishListeningFile);
  }

  getEnglishListeningFileContent(book: string): Observable<EnglishListeningLesson[] | undefined> {
    const currentfile = this.arEnglishListeningFile.find((df) => df.book === book);
    if (!currentfile) {
      return throwError(() => new Error('Data file is not found!'));
    }
    if (this.mapEnglishListeningFileLessons.has(book)) {
      return of(this.mapEnglishListeningFileLessons.get(book));
    }

    const url = `${environment.apiUrl}/api/Storage/englishlistening/${currentfile.file}`;
    return this.cachedGet<EnglishListeningLesson[], EnglishListeningLesson[]>(url, dfile => {
      this.mapEnglishListeningFileLessons.set(book, dfile);
      return dfile;
    });
  }

  getKnowledgeExerciseFile(): Observable<KnowledgeExerciseFile[]> {
    if (!this.isKnowledgeExerciseFileLoaded) {
      return this.cachedGet<KnowledgeExerciseFile[]>('data/knowledge-exercises/data.json', df => {
        this.isKnowledgeExerciseFileLoaded = true;
        this.arKnowledgeExerciseFile = df;
        return df;
      });
    }
    return of(this.arKnowledgeExerciseFile);
  }

  getKnowledgeExerciseFileContent(name: string): Observable<KnowledgeExerciseFileContent[] | undefined> {
    const currentfile = this.arKnowledgeExerciseFile.find((df) => df.name === name);
    if (!currentfile) {
      return throwError(() => new Error('Data file is not found!'));
    }
    if (this.mapKnowledgeExerciseFileContent.has(name)) {
      return of(this.mapKnowledgeExerciseFileContent.get(name));
    }

    const url = `data/knowledge-exercises/${currentfile.file}`;
    const cached = this.inflightRequests.get(url) as Observable<KnowledgeExerciseFileContent[]> | undefined;
    if (cached) {
      return cached;
    }

    const obs$ = this.http.get<QuestionBankItemCombinedInterface[]>(url).pipe(
      map((dfile) => {
        const items: KnowledgeExerciseFileContent[] = dfile.map((val) => {
          const item: KnowledgeExerciseFileContent = {
            id: val.id,
            order: val.order,
            itemType: val.itemType,
            audioReference: val.audioReference,
            answer: val.answer,
            answers: val.answers,
            hintofanswer: val.hintofanswer,
            tags: val.tags,
            images: val.images,
            referToID: val.referToID,
            question: val.question,
            questionFormat: val.questionFormat,
            options: val.options,
            questionLevel: val.questionLevel,
            rowsOfAnswers: val.rowsOfAnswers,
            items: val.items,
            difficulty: val.difficulty,
            suggestedCompletionTime: val.suggestedCompletionTime,
            extraInfo: val.extraInfo,

            itemTypeString: getQuestionBankTypeDescription(val.itemType)
          };
          item.hasAnswer = doesQuestionBankItemHasAnswer(item);
          return item;
        }).filter(val => val.question);
        this.mapKnowledgeExerciseFileContent.set(name, items);

        return items;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.inflightRequests.set(url, obs$);
    obs$.subscribe({
      error: () => this.inflightRequests.delete(url),
      complete: () => this.inflightRequests.delete(url),
    });
    return obs$;
  }

  addTemporaryLearnEnglishWordFile(name: string, content: LearnEnglishWordFileItem[]): void {
    this.mapLearnEnglishWordFileContent.set(name, content);
    
    // Also update the file list if needed
    const existingFile = this.arLearnEnglishWordDataFile.find(f => f.name === name);
    if (!existingFile) {
      this.arLearnEnglishWordDataFile.push({ name, file: name });
    }
  }
}