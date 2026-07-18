import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import type { LearningContent } from '../interfaces';
import type { LearnEnglishWordFileItem, LearnEnglishSentFileItem, LearnChineseFileItem, EnglishListeningLesson, QuestionBankItemCombinedInterface, KnowledgeExerciseFileContent, FormulaReciteContent, WordReference } from '../interfaces';
import { getQuestionBankTypeDescription, doesQuestionBankItemHasAnswer } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LearningContentService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/LearningContents`;
  private readonly storageApiUrl = `${environment.apiUrl}/api/Storage`;

  private cachedContentsByCategory = new Map<number, LearningContent[]>();
  private cachedWordContent = new Map<string, LearnEnglishWordFileItem[]>();
  private cachedWordReferences = new Map<string, WordReference[]>();
  private cachedSentContent = new Map<string, LearnEnglishSentFileItem[]>();
  private cachedKnowledgeContent = new Map<string, KnowledgeExerciseFileContent[]>();
  private cachedChineseContent = new Map<string, LearnChineseFileItem[]>();
  private cachedListeningContent = new Map<string, EnglishListeningLesson[]>();
  private cachedFormulaContent = new Map<string, FormulaReciteContent[]>();

  /**
   * Convert a fileUrl (e.g., "storage/learnenglish/cet4.json") to the authenticated API endpoint URL.
   * The StorageController serves files from the Storage folder with authentication.
   */
  getStorageFileUrl(fileUrl: string): string {
    // Remove "storage/" prefix if present
    const path = fileUrl.startsWith('storage/') ? fileUrl.substring(8) : fileUrl;
    return `${this.storageApiUrl}/${path}`;
  }

  /**
   * Get the base URL (directory URL) for resolving relative image paths within a JSON file.
   * For example, for fileUrl "storage/knowledge-exercises/data.json" returns
   * "{apiUrl}/api/Storage/knowledge-exercises/" — images referenced as "./image.png"
   * within that JSON will resolve to "{apiUrl}/api/Storage/knowledge-exercises/image.png".
   */
  getStorageFileBaseUrl(fileUrl: string): string {
    const fullUrl = this.getStorageFileUrl(fileUrl);
    // Strip the filename, leaving the directory URL with trailing slash
    return fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);
  }

  /** Fetch learning contents for a given category from the API. */
  getContentsByCategory(categoryId: number): Observable<LearningContent[]> {
    if (this.cachedContentsByCategory.has(categoryId)) {
      return of(this.cachedContentsByCategory.get(categoryId)!);
    }

    return this.http
      .get<LearningContent[]>(this.apiUrl, { params: { categoryId } })
      .pipe(tap(contents => this.cachedContentsByCategory.set(categoryId, contents)));
  }

  /** Fetch vocabulary file list (category=1) from the API. */
  getVocabularyContents(): Observable<LearningContent[]> {
    return this.getContentsByCategory(1);
  }

  /**
   * Fetch word items from the content's fileUrl.
   * The fileUrl is a relative path (e.g. "storage/learnenglish/cet4.json")
   * fetched via the authenticated StorageController API.
   */
  getVocabularyWordContent(fileUrl: string): Observable<LearnEnglishWordFileItem[]> {
    if (this.cachedWordContent.has(fileUrl)) {
      return of(this.cachedWordContent.get(fileUrl)!);
    }

    const url = this.getStorageFileUrl(fileUrl);
    return this.http.get<LearnEnglishWordFileItem[]>(url).pipe(
      map(items => (items ?? []).filter(item => item.enword && item.enword.length > 1)),
      tap(items => this.cachedWordContent.set(fileUrl, items))
    );
  }

  /**
   * Fetch per-word bilingual reference sentences (dictionary example sentences)
   * for the given word. Served by the authenticated StorageController at
   * `learnenglish/word_references/<word>.json`. Cached per word (lowercased).
   *
   * Errors (e.g. 404 when no reference file exists for the word, or 400 for
   * words the backend rejects) are NOT cached - they propagate to the caller
   * so it can show a "no reference available" state and a later retry is still
   * possible.
   */
  getWordReferences(word: string): Observable<WordReference[]> {
    const normalized = word.trim().toLowerCase();
    if (!normalized) {
      return of([]);
    }
    if (this.cachedWordReferences.has(normalized)) {
      return of(this.cachedWordReferences.get(normalized)!);
    }

    const url = this.getStorageFileUrl(`learnenglish/word_references/${normalized}.json`);
    return this.http.get<WordReference[]>(url).pipe(
      tap(items => this.cachedWordReferences.set(normalized, items ?? []))
    );
  }

  /** Fetch sentence file list (category=2) from the API. */
  getSentenceContents(): Observable<LearningContent[]> {
    return this.getContentsByCategory(2);
  }

  /** Fetch listening file list (category=3) from the API. */
  getListeningContents(): Observable<LearningContent[]> {
    return this.getContentsByCategory(3);
  }

  /** Fetch Chinese file list (category=4) from the API. */
  getChineseContents(): Observable<LearningContent[]> {
    return this.getContentsByCategory(4);
  }

  /**
   * Fetch Chinese learning items from the content's fileUrl.
   * The fileUrl is a relative path (e.g. "storage/learnchinese/juniorschool.json")
   * fetched via the authenticated StorageController API.
   */
  getChineseFileContent(fileUrl: string): Observable<LearnChineseFileItem[]> {
    if (this.cachedChineseContent.has(fileUrl)) {
      return of(this.cachedChineseContent.get(fileUrl)!);
    }

    const url = this.getStorageFileUrl(fileUrl);
    return this.http.get<LearnChineseFileItem[]>(url).pipe(
      tap(items => this.cachedChineseContent.set(fileUrl, items ?? []))
    );
  }

  /** Fetch knowledge bank file list (category=6) from the API. */
  getKnowledgeBankContents(): Observable<LearningContent[]> {
    return this.getContentsByCategory(6);
  }

  /**
   * Fetch knowledge exercise items from the content's fileUrl.
   * The fileUrl is a relative path (e.g. "storage/knowledge-exercises/data.json")
   * fetched via the authenticated StorageController API.
   */
  getKnowledgeExerciseContent(fileUrl: string): Observable<KnowledgeExerciseFileContent[]> {
    if (this.cachedKnowledgeContent.has(fileUrl)) {
      return of(this.cachedKnowledgeContent.get(fileUrl)!);
    }

    const url = this.getStorageFileUrl(fileUrl);
    return this.http.get<QuestionBankItemCombinedInterface[]>(url).pipe(
      map((dfile) => {
        const items: KnowledgeExerciseFileContent[] = dfile.map((val) => {
          const item: KnowledgeExerciseFileContent = {
            ...val,
            itemTypeString: getQuestionBankTypeDescription(val.itemType),
          };
          item.hasAnswer = doesQuestionBankItemHasAnswer(item);
          return item;
        }).filter(val => val.question);
        this.cachedKnowledgeContent.set(fileUrl, items);
        return items;
      })
    );
  }

  /**
   * Fetch sentence items from the content's fileUrl.
   * The fileUrl is a relative path (e.g. "storage/learnenglish/sentences.json")
   * fetched via the authenticated StorageController API.
   */
  getSentenceFileContent(fileUrl: string): Observable<LearnEnglishSentFileItem[]> {
    if (this.cachedSentContent.has(fileUrl)) {
      return of(this.cachedSentContent.get(fileUrl)!);
    }

    const url = this.getStorageFileUrl(fileUrl);
    return this.http.get<LearnEnglishSentFileItem[]>(url).pipe(
      map(items => (items ?? []).filter(item => item.ensent && item.ensent.length > 1)),
      tap(items => this.cachedSentContent.set(fileUrl, items))
    );
  }

  /**
   * Fetch listening lesson items from the content's fileUrl.
   * The fileUrl is a relative path (e.g. "storage/englishlistening/ltt1.json")
   * fetched via the authenticated StorageController API.
   */
  getListeningFileContent(fileUrl: string): Observable<EnglishListeningLesson[]> {
    if (this.cachedListeningContent.has(fileUrl)) {
      return of(this.cachedListeningContent.get(fileUrl)!);
    }

    const url = this.getStorageFileUrl(fileUrl);
    return this.http.get<EnglishListeningLesson[]>(url).pipe(
      tap(items => this.cachedListeningContent.set(fileUrl, items ?? []))
    );
  }

  /** Fetch formula file list (category=5) from the API. */
  getFormulaContents(): Observable<LearningContent[]> {
    return this.getContentsByCategory(5);
  }

  /**
   * Fetch formula recite items from the content's fileUrl.
   * The fileUrl is a relative path (e.g. "storage/formula/highschoolmath.json")
   * fetched via the authenticated StorageController API.
   */
  getFormulaFileContent(fileUrl: string): Observable<FormulaReciteContent[]> {
    if (this.cachedFormulaContent.has(fileUrl)) {
      return of(this.cachedFormulaContent.get(fileUrl)!);
    }

    const url = this.getStorageFileUrl(fileUrl);
    return this.http.get<FormulaReciteContent[]>(url).pipe(
      tap(items => this.cachedFormulaContent.set(fileUrl, items ?? []))
    );
  }

  /** Register temporary user-uploaded content in the cache. */
  addTemporaryContent(fileUrl: string, items: LearnEnglishWordFileItem[]): void {
    this.cachedWordContent.set(fileUrl, items.filter(item => item.enword.length > 1));
  }
}
