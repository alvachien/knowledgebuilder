import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import type { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import type {
  LearnEnglishWordFileItem,
  LearningContent,
  ReviewQueueItem,
  VocabularyOptionCore,
  VocabularyWorksheetOption,
  VocabularySelectOption,
  VocabularyReviewOption,
  VocabularyQuizOption,
  VocabularySpellingOption,
  VocabularyDictationOption,
  VocabularySpellingQueue,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  VocabularyListFilter,
  WordCondition,
  RatingCondition,
} from '../../interfaces';
import {
  QuestionBankTypeEnum,
  SelectionModeEnum,
  buildVocabularyQuizQuestions,
  isVocabularyListFilterEmpty,
  matchVocabularyListFilter,
} from '../../interfaces';
import { LearningContentService, LearningRatingService, UIService } from '../../services';
import { FooterComponent } from '../../shared/footer/footer';
import { fisherYatesShuffle } from '../../shared/utils/shuffle';
import { AppPageTitle } from '../page-title/page-title';

import { VocabularyExercisesQuizResultComponent } from './vocabulary-exercises-quiz-result.component';
import { VocabularyExercisesQuizSessionComponent } from './vocabulary-exercises-quiz-session.component';
import { VocabularyQuizSessionStore } from './vocabulary-exercises-quiz-session.store';
import { VocabularyExercisesQuizOptionsDialogComponent } from './vocabulary-exercises-quizoptions-dialog.component';
import { VocabularyExercisesDictationOptionsDialogComponent } from './vocabulary-exercises-dictationoptions-dialog.component';
import { VocabularyExercisesDictationResultComponent } from './vocabulary-exercises-dictation-result.component';
import { VocabularyExercisesDictationSessionComponent } from './vocabulary-exercises-dictation-session.component';
import { VocabularyDictationSessionStore } from './vocabulary-exercises-dictation-session.store';
import { VocabularyExercisesRatingFilterDialogComponent } from './vocabulary-exercises-rating-filter-dialog.component';
import { VocabularyExercisesReviewSessionComponent } from './vocabulary-exercises-review-session.component';
import { VocabularyReviewSessionStore } from './vocabulary-exercises-review-session.store';
import { VocabularyExercisesReviewOptionsDialogComponent } from './vocabulary-exercises-reviewoptions-dialog.component';
import { VocabularySelectDialogComponent } from './vocabulary-exercises-select-dialog.component';
import { VocabularyExercisesSpellingResultComponent } from './vocabulary-exercises-spelling-result.component';
import { VocabularyExercisesSpellingSessionComponent } from './vocabulary-exercises-spelling-session.component';
import { VocabularySpellingSessionStore } from './vocabulary-exercises-spelling-session.store';
import { VocabularyExercisesSpellingOptionsDialogComponent } from './vocabulary-exercises-spellingoptions-dialog.component';
import { VocabularyExercisesWordFilterDialogComponent } from './vocabulary-exercises-word-filter-dialog.component';
import { VocabularyExercisesWordListComponent } from './vocabulary-exercises-word-list.component';
import { VocabularyExercisesWorksheetOptionsDialogComponent } from './vocabulary-exercises-worksheetoptions-dialog.component';

/** The screens of the vocabulary exercises page, switched via @switch in the template. */
export type VocabularyExercisesMode = 'list' | 'review' | 'spelling' | 'spellingresult' | 'dictation' | 'dictationresult' | 'quiz' | 'quizresult';

@Component({
  selector: 'app-vocabulary-exercises',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FooterComponent,
    VocabularyExercisesWordListComponent,
    VocabularyExercisesReviewSessionComponent,
    VocabularyExercisesSpellingSessionComponent,
    VocabularyExercisesSpellingResultComponent,
    VocabularyExercisesDictationSessionComponent,
    VocabularyExercisesDictationResultComponent,
    VocabularyExercisesQuizSessionComponent,
    VocabularyExercisesQuizResultComponent,
  ],
  templateUrl: './vocabulary-exercises.component.html',
  styleUrl: './vocabulary-exercises.component.scss',
  providers: [VocabularySpellingSessionStore, VocabularyReviewSessionStore, VocabularyDictationSessionStore, VocabularyQuizSessionStore],
  host: {
    class: 'app-main-content',
  },
})
export class VocabularyExercisesComponent implements OnInit {
  allFiles = signal<LearningContent[]>([]);
  selectedFile = signal<LearningContent | undefined>(undefined);
  isLoadingContents = signal(true);
  // Current screen. Replaces the former isStudying / isTypingInProgress /
  // isTypingCompleted boolean trio; the template switches on it via @switch.
  mode = signal<VocabularyExercisesMode>('list');
  // Table for content (rendered by the word-list child component, which also
  // wires the paginator/sort it owns onto this shared data source).
  dataSource: MatTableDataSource<LearnEnglishWordFileItem> = new MatTableDataSource();
  selection = new SelectionModel<LearnEnglishWordFileItem>(true, []);
  // Ratings of the loaded file's items. Replaced (not mutated) on every update
  // so the new reference reaches the OnPush word-list child as an input.
  contentRatingMap = signal(new Map<number, number>());
  // Filter bar: the container is the single source of truth for the applied
  // word/rating conditions (it opens the dialogs). freeText is fed back from
  // the child's live input via freeTextChanged.
  freeText = signal('');
  wordConditions = signal<WordCondition[]>([]);
  ratingConditions = signal<RatingCondition[]>([]);
  // Parsed form of the active list filter; applyListFilter keeps it in sync
  // with dataSource.filter so the row predicate does not JSON.parse per row.
  // Null means no filter (MatTable skips the predicate for an empty filter).
  private listFilterCriteria: VocabularyListFilter | null = null;
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Service
  private readonly contentService = inject(LearningContentService);
  readonly dialog = inject(MatDialog);
  // Navigation
  readonly router = inject(Router);
  readonly uiService = inject(UIService);
  private readonly ratingService = inject(LearningRatingService);
  private readonly destroyRef = inject(DestroyRef);
  // Spelling session state/behavior; provided on this component so the spelling
  // and result screens share one instance.
  readonly spellingStore = inject(VocabularySpellingSessionStore);
  // Review session state/behavior; provided on this component so the review
  // screen and this container share one instance.
  readonly reviewStore = inject(VocabularyReviewSessionStore);
  // Quiz session state/behavior; provided on this component so the quiz and
  // result screens share one instance.
  readonly quizStore = inject(VocabularyQuizSessionStore);
  // Dictation session state/behavior; provided on this component so the
  // dictation and result screens share one instance.
  readonly dictationStore = inject(VocabularyDictationSessionStore);
  // Maps selected file index to backend ContentId
  studyContentId = 0;
  // Latest rating the user requested per item in the list view; upsert
  // responses that arrive out of order are dropped against this map.
  private pendingContentRatings = new Map<number, number>();
  // Monotonic token of the current file load. Rapid file switches are
  // last-click-wins: a slow response from a previous file must not overwrite
  // the newly selected file's data/ratings (both loads compare against it).
  private fileLoadToken = 0;
  // Set when the component is destroyed so the async FileReader.onload
  // callback (which has no takeUntilDestroyed) bails instead of writing
  // signals/allFiles of a gone component (L5).
  private isDestroyed = false;
  // Review options (session state itself lives in reviewStore).
  reviewSetting: VocabularyReviewOption = {
    disableVoice: false,
    hideExplain: false,
    countOfItems: 20,
  };
  // Spelling options (session state itself lives in spellingStore).
  spellingSetting: VocabularySpellingOption = {
    disableVoice: false,
    hideExplain: false,
    countOfItems: 20,
  };
  // Quiz options (session state itself lives in quizStore).
  quizSetting: VocabularyQuizOption = {
    direction: 'en2cn',
    countOfItems: 20,
  };
  // Dictation options (session state itself lives in dictationStore). Per spec
  // there is no hide-audio/hide-description toggle, only the item count.
  dictationSetting: VocabularyDictationOption = {
    countOfItems: 20,
  };
  // Worksheet options.
  worksheetSetting: VocabularyWorksheetOption = {
    countOfItems: 20,
    printEntryDate: true,
    uniformBlankLength: true,
  };

  /** Rows the table currently shows: the filtered count when a filter is active. */
  get visibleRowCount(): number {
    return this.dataSource.filter
      ? this.dataSource.filteredData.length
      : this.dataSource.data.length;
  }

  /**
   * Whether every visible row is selected. Comparing against the visible rows
   * (not just counts) keeps the header checkbox honest when the selection also
   * contains rows the current filter hides.
   */
  isAllSelected() {
    const visible = this.getVisibleData();
    return visible.length > 0 && visible.every(row => this.selection.isSelected(row));
  }

  /**
   * Selects all visible rows if they are not all selected; otherwise clear
   * selection. Scoped to the filtered rows so the table filter keeps
   * describing what Review/Spelling/Worksheet will use (see getVisibleData).
   * Replaces any previous selection: it may still contain rows the current
   * filter hides, and hidden rows would otherwise leak into the exercises.
   */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.setSelection(...this.getVisibleData());
  }

  constructor() {
    // The store cannot switch screens; when the last word completes, move to
    // the result screen here.
    effect(() => {
      if (this.spellingStore.isComplete() && this.mode() === 'spelling') {
        this.mode.set('spellingresult');
      }
    });

    // Mirror of the spelling effect: when the last quiz question is answered,
    // move to the quiz result screen.
    effect(() => {
      if (this.quizStore.isComplete() && this.mode() === 'quiz') {
        this.mode.set('quizresult');
      }
    });

    // Mirror of the spelling/quiz effects: when the last dictated word has
    // been spoken, move to the dictation result screen.
    effect(() => {
      if (this.dictationStore.isComplete() && this.mode() === 'dictation') {
        this.mode.set('dictationresult');
      }
    });

    this.dataSource.sortingDataAccessor = (
      data: LearnEnglishWordFileItem,
      sortHeaderId: string
    ): string | number => {
      if (sortHeaderId === 'rating') {
        return this.getRating(data.id);
      }
      // Validate the sort key against known fields to avoid `as any` escape.
      const validKeys: (keyof LearnEnglishWordFileItem)[] = ['id', 'enword', 'cnword'];
      const key = validKeys.includes(sortHeaderId as keyof LearnEnglishWordFileItem)
        ? (sortHeaderId as keyof LearnEnglishWordFileItem)
        : 'enword';
      const value = data[key];
      return typeof value === 'string' ? value.toLowerCase() : (value ?? 0);
    };
    // Filter bar criteria travel through MatTableDataSource's single string
    // channel as JSON; applyListFilter parses it once into listFilterCriteria
    // (the rating lives in contentRatingMap, so the predicate closes over
    // `this` to reach both via getRating).
    this.dataSource.filterPredicate = (
      data: LearnEnglishWordFileItem
    ): boolean =>
      matchVocabularyListFilter(data, this.getRating(data.id), this.listFilterCriteria!);

    // The FileReader.onload callback (temp-file upload) has no
    // takeUntilDestroyed guard; flag destruction so it bails instead of
    // mutating a gone component's signals/allFiles and registering temp
    // content in the service cache after navigation (L5).
    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
    });
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Vocabulary';

    this.contentService
      .getVocabularyContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: contents => {
        this.allFiles.set(contents);
        this.isLoadingContents.set(false);
      },
      error: err => {
        console.error(err);
        this.isLoadingContents.set(false);
      },
    });
  }

  applyListFilter(criteria: VocabularyListFilter) {
    // Parsed once here; the row predicate reads this field instead of
    // JSON.parse-ing the filter string for every row.
    this.listFilterCriteria = isVocabularyListFilterEmpty(criteria) ? null : criteria;
    // An empty filter string keeps the "no filter" contract the rest of the
    // page relies on (visibleRowCount, getVisibleData).
    this.dataSource.filter = this.listFilterCriteria === null
      ? ''
      : JSON.stringify(criteria);
  }

  onFreeTextChanged(text: string): void {
    this.freeText.set(text);
    this.applyCurrentFilter();
  }

  onDefineWordFilter(): void {
    this.dialog
      .open(VocabularyExercisesWordFilterDialogComponent, {
        data: this.wordConditions(),
        width: '480px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        // undefined (Cancel / backdrop / Esc) leaves the previous filter untouched.
        if (result !== undefined) {
          this.wordConditions.set(result);
          this.applyCurrentFilter();
        }
      });
  }

  onClearWordFilter(): void {
    this.wordConditions.set([]);
    this.applyCurrentFilter();
  }

  onDefineRatingFilter(): void {
    this.dialog
      .open(VocabularyExercisesRatingFilterDialogComponent, {
        data: this.ratingConditions(),
        width: '480px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.ratingConditions.set(result);
          this.applyCurrentFilter();
        }
      });
  }

  onClearRatingFilter(): void {
    this.ratingConditions.set([]);
    this.applyCurrentFilter();
  }

  /**
   * Clear the table selection from the Quick Selection menu. Mirrors the
   * selection.clear() calls used on file switch / toggle-all: drops every
   * selected row so Review/Spelling/Dictation/Worksheet no longer act on a
   * stale selection.
   */
  onClearSelection(): void {
    this.selection.clear();
  }

  /**
   * Quick selection from the filter bar. Random reuses Free Selection (count on
   * a shuffled source), Sequence reuses By Count (count + offset on the sorted
   * source), Words reuses By Word (comma-separated word list); all open the
   * same unified select dialog as the Select menu.
   */
  onQuickSelect(mode: 'random' | 'sequence' | 'words'): void {
    const selectMode =
      mode === 'random' ? SelectionModeEnum.FreeSelection
      : mode === 'sequence' ? SelectionModeEnum.ByCount
      : SelectionModeEnum.ByID;
    this.onSelect(selectMode);
  }

  private applyCurrentFilter(): void {
    this.applyListFilter({
      freeText: this.freeText(),
      wordConditions: this.wordConditions(),
      ratingConditions: this.ratingConditions(),
    });
  }

  getRating(itemId: number | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    return this.contentRatingMap().get(itemId) ?? 0;
  }

  onContentRatingChanged(item: LearnEnglishWordFileItem, event: MatButtonToggleChange) {
    if (event.value === undefined || event.value === null || event.value < 1) {
      // Clicking the active toggle deselects it (value becomes undefined).
      // There is no "clear rating" operation, so restore the previous selection.
      event.source.buttonToggleGroup.value = event.source.value;
      return;
    }
    if (this.studyContentId <= 0 || item.id === undefined) {
      return;
    }

    this.pendingContentRatings.set(item.id, event.value);
    this.ratingService
      .upsertRating(this.studyContentId, item.id, event.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          // Drop stale responses: a newer click on the same item is already
          // in flight and its response will set the final value.
          if (this.pendingContentRatings.get(item.id!) !== event.value) {
            return;
          }
          this.contentRatingMap.update(m => new Map(m).set(item.id!, saved.rating));
          // The filter predicate closes over contentRatingMap, and a rating
          // change does not change the filter string — reassign it to force a
          // re-run while a filter is active, or the table shows stale rows.
          if (this.dataSource.filter) {
            this.dataSource.filter = this.dataSource.filter;
          }
        },
        error: err => {
          console.error('Failed to save rating', err);
          // A newer click on the same item is in flight; its outcome decides
          // the final value — reverting now would clobber it.
          if (this.pendingContentRatings.get(item.id!) !== event.value) {
            return;
          }
          this.pendingContentRatings.delete(item.id!);
          // Revert the toggle to the last confirmed value so the view does
          // not show a rating the server never saved. The [ngModel] binding
          // value is unchanged (no writeValue runs), so the group must be
          // reset directly, like the deselect path above.
          event.source.buttonToggleGroup.value = this.getRating(item.id);
        },
      });
  }

  onFileSelectionChanged(event: MatSelectChange) {
    // Drop any selection carried over from the previously loaded file — the
    // SelectionModel holds references to the old file's row objects, which are
    // no longer relevant and would otherwise keep the review/worksheet buttons
    // acting on stale rows.
    this.selection.clear();
    this.pendingContentRatings.clear();

    if (!event.value) {
      this.fileLoadToken++;
      this.dataSource.data = [];
      this.studyContentId = 0;
      this.contentRatingMap.set(new Map());
      return;
    }

    const selectedContent = event.value as LearningContent;
    this.studyContentId = selectedContent.id;
    const token = ++this.fileLoadToken;
    // Clear the rating map BEFORE subscribing to content: cached content
    // resolves synchronously, so the content `next` (which re-runs the
    // filter predicate) would otherwise filter the new file's rows against
    // the previous file's ratings (L4).
    this.contentRatingMap.set(new Map());

    this.contentService
      .getVocabularyWordContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (df?: LearnEnglishWordFileItem[]) => {
        // A newer selection (or a temp-file upload) superseded this load.
        if (token !== this.fileLoadToken) {
          return;
        }
        // Empty the wordqueues
        if (df) {
          this.dataSource.data = df.slice();
        }
      },
      error: err => {
        console.error(err);
        // A newer selection superseded this load; its error is stale.
        if (token !== this.fileLoadToken) {
          return;
        }
        // The new file failed to load: drop the previous file's rows so they
        // are not shown (and rated) under the new file's studyContentId,
        // which would persist ratings into the wrong file. Bump the token so
        // the in-flight ratings load for this file is discarded too (L3).
        this.fileLoadToken++;
        this.dataSource.data = [];
        this.studyContentId = 0;
        this.contentRatingMap.set(new Map());
        this.pendingContentRatings.clear();
      },
    });

    // Fetch ratings for this content from the API
    if (this.studyContentId > 0) {
      this.ratingService
        .getRatings(this.studyContentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (ratings) => {
            if (token !== this.fileLoadToken) {
              return;
            }
            const newRatingMap = new Map<number, number>();
            for (const r of ratings) {
              if (r.itemId !== undefined) {
                newRatingMap.set(r.itemId, r.rating);
              }
            }
            this.contentRatingMap.set(newRatingMap);
            // The predicate closes over contentRatingMap, and the data was
            // (re)filtered while the map was still empty — force a re-run now
            // that real ratings are in, or a persisted rating filter shows
            // stale rows (same trick as onContentRatingChanged).
            if (this.dataSource.filter) {
              this.dataSource.filter = this.dataSource.filter;
            }
          },
          error: err => {
            console.error('Failed to load ratings', err);
            // Re-evaluate the rows against the (empty) rating map instead of
            // leaving them filtered by the previous file's ratings until the
            // next change — mirrors the success path (L4).
            if (token !== this.fileLoadToken) {
              return;
            }
            if (this.dataSource.filter) {
              this.dataSource.filter = this.dataSource.filter;
            }
          },
        });
    }
  }

  onAddFileButtonClick(fileInputRef: HTMLInputElement) {
    fileInputRef.click();
  }

  onAddTempFile(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Reset the input right away: unless its value changes, picking the
      // same file again (e.g. a corrected re-upload) fires no change event
      // and the upload would silently do nothing. The File object captured
      // above stays valid for the async read.
      inputElement.value = '';

      const reader = new FileReader();

      reader.onload = e => {
        // Navigating away mid-read destroys the component; the callback has no
        // takeUntilDestroyed, so check the destroy flag before mutating state
        // or registering temp content in the service cache (L5).
        if (this.isDestroyed) {
          return;
        }
        try {
          const fileContent = e.target!.result as string;
          const parsed: unknown = JSON.parse(fileContent);

          // Validate schema: must be an array of objects with string enword/cnword
          if (!Array.isArray(parsed)) {
            console.error('Invalid file format: expected a JSON array.');
            return;
          }

          const arwords: LearnEnglishWordFileItem[] = [];
          const MAX_ITEMS = 10000;
          const MAX_WORD_LENGTH = 500;

          for (const item of parsed) {
            if (typeof item !== 'object' || item === null) {
              console.error('Invalid file format: array items must be objects.');
              return;
            }
            const obj = item as Record<string, unknown>;
            if (typeof obj['enword'] !== 'string' || typeof obj['cnword'] !== 'string') {
              console.error('Invalid file format: each item must have string "enword" and "cnword" properties.');
              return;
            }
            // Same contract as LearningContentService's word files: words
            // longer than one character (see docs/data-models.md).
            if (obj['enword'].length <= 1) {
              console.error('Invalid word length: "enword" must be longer than one character.');
              return;
            }
            if (obj['enword'].length > MAX_WORD_LENGTH || obj['cnword'].length > MAX_WORD_LENGTH) {
              console.error(`Invalid word length (max ${MAX_WORD_LENGTH} characters).`);
              return;
            }
            arwords.push({ enword: obj['enword'], cnword: obj['cnword'] });
            if (arwords.length >= MAX_ITEMS) {
              break;
            }
          }

          if (arwords.length === 0) {
            console.error('No valid vocabulary items found in file.');
            return;
          }

          // Generate a unique temp file URL
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const tempFileUrl = `temp-${timestamp}.json`;

          // Create a synthetic LearningContent entry for the temp file
          const tempContent: LearningContent = {
            id: -(Date.now()),
            categoryId: 1,
            nameEnglish: tempFileUrl,
            nameChinese: '临时文件',
            fileUrl: tempFileUrl,
          };

          // Register content in the learning content service cache
          this.contentService.addTemporaryContent(tempFileUrl, arwords);

          // Reset cross-file state, mirroring onFileSelectionChanged: stale
          // selections from the previous file would otherwise override the
          // freshly loaded rows in review/spelling/worksheet prep. The negative temp
          // id keeps every `studyContentId > 0` rating guard inactive. The
          // token bump also invalidates any in-flight load of the previous
          // file, whose late response would otherwise overwrite these rows.
          this.selection.clear();
          this.studyContentId = tempContent.id;
          this.fileLoadToken++;
          this.contentRatingMap.set(new Map());
          this.pendingContentRatings.clear();

          // Add to file list and select it.
          this.allFiles.update(files => [...files, tempContent]);
          this.selectedFile.set(tempContent);

          // Update data source
          this.dataSource.data = arwords.slice();
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };

      reader.readAsText(selectedFile);
    }
  }

  onDownloadTemplateButtonClick() {
    const templateData: LearnEnglishWordFileItem[] = [{ enword: 'example', cnword: '示例' }];

    const dataStr = JSON.stringify(templateData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onReviewWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesReviewOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        currentSettings: this.reviewSetting,
      },
      width: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        this.reviewSetting.disableVoice = result.disableVoice;
        this.reviewSetting.hideExplain = result.hideExplain;
        this.reviewSetting.countOfItems = result.countOfItems;

        this.onReviewCore();
      }
    });
  }

  private coverContentToQueue(content: LearnEnglishWordFileItem[]): VocabularySpellingQueue[] {
    const queues: VocabularySpellingQueue[] = [];
    content.forEach(val => {
      queues.push({
        enword: val.enword,
        cnword: val.cnword,
        completed: false,
      });
    });

    return queues;
  }

  /**
   * Rows the table currently shows: filteredData when a filter is active.
   * Exercise queue prep and the By Filter selection consume this so the table
   * filter always describes what Review/Spelling/Worksheet will use.
   */
  private getVisibleData(): LearnEnglishWordFileItem[] {
    return this.dataSource.filter ? this.dataSource.filteredData : this.dataSource.data.slice();
  }

  /**
   * Shared queue-prep pipeline for Review, Spelling and Worksheet when no table rows
   * are selected: only when over the limit, shuffle and cap to countOfItems.
   * Never mutates `items` (shuffle/slice produce new arrays). Callers with an
   * explicit table selection bypass this and use the selected rows directly.
   */
  private prepareWordQueue<T>(
    items: T[],
    options: VocabularyOptionCore
  ): T[] {
    let queues = items;
    if (queues.length > options.countOfItems) {
      // Randomize the array, then keep only the first `countOfItems` items
      queues = fisherYatesShuffle(queues);
      queues = queues.slice(0, options.countOfItems);
    }

    return queues;
  }

  // Study: queue prep stays here (it needs the table's selection/filter); the
  // session itself lives in reviewStore.
  onReviewCore() {
    let sourceItems: LearnEnglishWordFileItem[] = [];
    if (this.selection.selected.length > 0) {
      sourceItems = this.selection.selected.slice();
      // Randomize the array
      sourceItems = fisherYatesShuffle(sourceItems);
    } else {
      sourceItems = this.prepareWordQueue(this.getVisibleData(), this.reviewSetting);
    }

    const queue: ReviewQueueItem[] = sourceItems.map(val => ({
      enword: val.enword,
      cnword: val.cnword,
      rating: 0,
      itemId: val.id,
    }));

    // Nothing to review (e.g. a filter excluded every word): stay on the list.
    if (this.reviewStore.start(queue, this.reviewSetting.disableVoice, this.studyContentId)) {
      this.mode.set('review');
    }
  }

  /**
   * Leave the review session: merge the confirmed ratings captured during it
   * back into the list view's source of truth (contentRatingMap) so the rating
   * column reflects any changes once the list is shown again.
   */
  onQuitReview() {
    const confirmedRatings = this.reviewStore.quit();

    const newRatingMap = new Map(this.contentRatingMap());
    for (const [itemId, rating] of confirmedRatings) {
      newRatingMap.set(itemId, rating);
    }
    this.contentRatingMap.set(newRatingMap);
    // Ratings changed during the session may move rows in or out of an active
    // rating filter; the filter string itself is unchanged, so reassign it to
    // force the predicate to re-run (same trick as onContentRatingChanged).
    if (this.dataSource.filter && confirmedRatings.size > 0) {
      this.dataSource.filter = this.dataSource.filter;
    }

    this.mode.set('list');
  }

  onSpellingWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesSpellingOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        currentSettings: this.spellingSetting,
      },
      width: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        this.spellingSetting.disableVoice = result.disableVoice;
        this.spellingSetting.hideExplain = result.hideExplain;
        this.spellingSetting.countOfItems = result.countOfItems;

        this.onSpellingStart();
      }
    });
  }

  onSpellingStart() {
    let items: VocabularySpellingQueue[];
    if (this.selection.selected.length > 0) {
      items = this.coverContentToQueue(this.selection.selected);
    } else {
      items = this.prepareWordQueue(
        this.coverContentToQueue(this.getVisibleData()),
        this.spellingSetting
      );
    }

    // Nothing to type (e.g. a filter excluded every word): stay on the list.
    if (this.spellingStore.start(items, this.spellingSetting.disableVoice)) {
      this.mode.set('spelling');
    }
  }

  /**
   * Leave the spelling session (quit mid-session or back from the result
   * screen): drop every piece of spelling state, then return to the list.
   */
  onQuitSpelling() {
    this.spellingStore.reset();
    this.mode.set('list');
  }

  onDictationWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesDictationOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        currentSettings: this.dictationSetting,
      },
      width: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.dictationSetting.countOfItems = result.countOfItems;

          this.onDictationStart();
        }
      });
  }

  /**
   * Build the dictation queue: the queue follows the same selection mechanism
   * as Review/Spelling (explicit table selection, otherwise the filtered rows
   * run through prepareWordQueue). The store speaks each word in turn on a
   * fixed interval; there is no typing.
   */
  onDictationStart() {
    let items: VocabularySpellingQueue[];
    if (this.selection.selected.length > 0) {
      items = this.coverContentToQueue(this.selection.selected);
    } else {
      items = this.prepareWordQueue(
        this.coverContentToQueue(this.getVisibleData()),
        this.dictationSetting
      );
    }

    // Nothing to dictate (e.g. a filter excluded every word): stay on the list.
    if (this.dictationStore.start(items)) {
      this.mode.set('dictation');
    }
  }

  /**
   * Leave the dictation session (quit mid-session or back from the result
   * screen): drop every piece of dictation state (which also cancels the
   * pending tick and any in-flight speech), then return to the list.
   */
  onQuitDictation() {
    this.dictationStore.reset();
    this.mode.set('list');
  }

  onQuizWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesQuizOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        currentSettings: this.quizSetting,
      },
      width: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.quizSetting.direction = result.direction;
          this.quizSetting.countOfItems = result.countOfItems;

          this.onQuizStart();
        }
      });
  }

  /**
   * Build single-choice questions for the quiz: the queue follows the same
   * selection mechanism as Review/Spelling (explicit table selection, otherwise
   * the filtered rows run through prepareWordQueue), and the distractor pool
   * is the visible rows so the filter bar keeps describing what the quiz uses.
   */
  onQuizStart() {
    const visible = this.getVisibleData();
    // Distractor pool: the visible (filtered) rows, so the filter bar keeps
    // describing what the quiz uses. Fall back to the whole file when a stale
    // selection outlives the filter that produced it (visible empty).
    const pool = visible.length > 0 ? visible : this.dataSource.data.slice();
    let sourceItems: LearnEnglishWordFileItem[];
    if (this.selection.selected.length > 0) {
      sourceItems = this.selection.selected.slice();
      // Randomize the array
      sourceItems = fisherYatesShuffle(sourceItems);
    } else {
      sourceItems = this.prepareWordQueue(visible, this.quizSetting);
    }

    const questions = buildVocabularyQuizQuestions(sourceItems, pool, this.quizSetting.direction);

    // Nothing to ask (e.g. a filter excluded every word, or every visible row
    // shares one explanation): stay on the list.
    if (this.quizStore.start(questions)) {
      this.mode.set('quiz');
    }
  }

  /**
   * Leave the quiz session (quit mid-session or back from the result screen):
   * drop every piece of quiz state, then return to the list.
   */
  onQuitQuiz() {
    this.quizStore.reset();
    this.mode.set('list');
  }

  onWorksheetWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesWorksheetOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        title: this.selectedFile()?.nameEnglish,
        currentSettings: this.worksheetSetting,
      },
      width: '600px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        if (result.subTitle) {
          this.worksheetSetting.subTitle = result.subTitle;
        } else {
          this.worksheetSetting.subTitle = undefined;
        }
        this.worksheetSetting.countOfItems = result.countOfItems;
        this.worksheetSetting.printEntryDate = result.printEntryDate;
        this.worksheetSetting.printFirstLetter = result.printFirstLetter;
        this.worksheetSetting.uniformBlankLength = result.uniformBlankLength;
        this.worksheetSetting.uniformBlankLengthSize = result.uniformBlankLengthSize;

        this.onNewWorksheetCore();
      }
    });
  }

  onNewWorksheetCore() {
    let worksheetqueues: VocabularySpellingQueue[] = [];
    if (this.selection.selected.length > 0) {
      worksheetqueues = this.coverContentToQueue(this.selection.selected);
      // Randomize the array
      worksheetqueues = fisherYatesShuffle(worksheetqueues);
    } else {
      worksheetqueues = this.prepareWordQueue(
        this.coverContentToQueue(this.getVisibleData()),
        this.worksheetSetting
      );
    }

    const items: KnowledgeExerciseFileContent[] = [];
    worksheetqueues.forEach((queueitem, idx) => {
      const nidx = idx + 1;
      items.push({
        id: nidx.toString(),
        order: nidx,
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question: `${queueitem.cnword.substring(0, 50)} ${this.worksheetSetting.printFirstLetter ? queueitem.enword[0] : ''} @${queueitem.enword}@`,
      });
    });
    const execPrintSetting: KnowledgeExercisePrintOption = {
      formTitle: this.worksheetSetting.subTitle ?? '',
      printEntryDate: this.worksheetSetting.printEntryDate ?? true,
      printScore: true,
      printAnswer: true,
      printHintOfAnswer: false,
      printID: false,
      hideLabelOfQuestionType: [QuestionBankTypeEnum.FillInTheBlank],
      uniformBlankLength: this.worksheetSetting.uniformBlankLength,
      uniformBlankLengthSize: this.worksheetSetting.uniformBlankLengthSize,
    };
    this.uiService.setSelectedExerciseItem(items, execPrintSetting);
    void this.router.navigate(['/knowledge/displayv2']);
  }

  /** Returns the visible (filtered) rows in the current sort order (mirrors MatSort behavior). */
  private getSortedData(): LearnEnglishWordFileItem[] {
    // The MatSort instance lives in the word-list child, which wires it onto
    // this shared data source. Selection strategies consume the same rows the
    // table shows, so start from the filtered set.
    const source = this.getVisibleData();
    const sort = this.dataSource.sort;
    if (!sort || !sort.active || sort.direction === '') {
      return source;
    }

    const sorted = source.slice();
    sorted.sort((a, b) => {
      const valueA = this.dataSource.sortingDataAccessor(a, sort.active);
      const valueB = this.dataSource.sortingDataAccessor(b, sort.active);

      let result = 0;
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        result = valueA.localeCompare(valueB);
      } else {
        result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }

      return sort.direction === 'asc' ? result : -result;
    });

    return sorted;
  }

  /**
   * Select `count` items from `source` starting at `offset` (window [offset, offset+count)).
   * Backs both By Count (sorted source) and Free Selection (shuffled source, offset 0) -
   * the two modes differ only in the source array and whether offset is exposed.
   */
  private applyCountSelection(
    source: LearnEnglishWordFileItem[],
    offset: number,
    count: number
  ): void {
    this.selection.clear();
    source.forEach((item, index) => {
      if (index >= offset && index < offset + count) {
        this.selection.select(item);
      }
    });
  }

  onSelect(mode: SelectionModeEnum) {
    const dialogRef = this.dialog.open(VocabularySelectDialogComponent, {
      // rowCount bounds By Count's offset (M13); visibleWords lets By Word
      // validate at least one match (M14). Both are snapshots of the visible
      // (filtered) rows, so the dialog's validation matches what selection will
      // actually act on.
      data: {
        mode,
        rowCount: this.visibleRowCount,
        visibleWords: this.getVisibleData().map(w => w.enword),
      },
      // By Word (ByID) needs a wider dialog for the multi-line word list.
      width: mode === SelectionModeEnum.ByID ? '500px' : '400px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.applySelectionOption(result);
        }
      });
  }

  /**
   * Apply a VocabularySelectOption produced by the unified select dialog.
   * Each mode maps to its selection strategy; By Count and Free Selection share
   * applyCountSelection (Free is By Count on a shuffled source with offset 0).
   */
  private applySelectionOption(option: VocabularySelectOption): void {
    switch (option.selectedSelectMode) {
      case SelectionModeEnum.ByCount: {
        const count = option.countOfItems ?? 0;
        if (count > 0) {
          this.applyCountSelection(this.getSortedData(), option.countOfOffset ?? 0, count);
        }
        break;
      }
      case SelectionModeEnum.FreeSelection: {
        const count = option.countOfItems ?? 0;
        if (count > 0) {
          this.applyCountSelection(fisherYatesShuffle(this.getVisibleData()), 0, count);
        }
        break;
      }
      case SelectionModeEnum.ByID: {
        // By Word: match enword text against the supplied list. Normalize
        // separators (newlines/whitespace -> commas) so pasted lists work, and
        // only touch the selection when at least one token matches — a no-match
        // paste must never silently wipe the existing selection (M14).
        const tokens = (option.importIDs ?? '')
          .split(/[\n\r,]+/)
          .map(t => t.trim())
          .filter(t => t.length > 0);
        if (tokens.length > 0) {
          const tokenSet = new Set(tokens);
          const matched = this.getVisibleData().filter(item => tokenSet.has(item.enword));
          if (matched.length > 0) {
            this.selection.clear();
            matched.forEach(item => this.selection.select(item));
          }
        }
        break;
      }
    }
  }
}
