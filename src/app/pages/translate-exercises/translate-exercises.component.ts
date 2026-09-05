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
import { FisherYatesShuffle, type FilterRoot } from 'actslib';

import type {
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  LearnEnglishSentFileItem,
  LearningContent,
  SentenceListFilter,
  SentenceQuizOption,
  SentenceReviewOption,
  SentenceReviewQueueItem,
  TranslateExerciseOption,
  TranslateExercisePrintOption,
  TranslateQueue,
  VocabularySelectOption,
} from '../../interfaces';
import {
  QuestionBankTypeEnum,
  SENTENCE_FILTER_PROPERTIES,
  SelectionModeEnum,
  TranslateDirectionEnum,
  buildSentenceQuizQuestions,
  isSentenceListFilterEmpty,
  matchSentenceListFilter,
} from '../../interfaces';
import {
  AIService,
  AudioService,
  LearningContentService,
  LearningRatingService,
  UIService,
  ratingItemKey,
} from '../../services';
import { openFilterDialog } from '../../shared/filter-dialog/filter-dialog-launcher';
import { emptyFilterDefinition } from '../../shared/filter-dialog/filter-dialog-model';
import { FooterComponent } from '../../shared/footer/footer';
import { AppPageTitle } from '../page-title/page-title';

import { TranslateExercisesInfoDialogComponent } from './translate-exercises-info-dialog.component';
import { TranslateExercisesLLMDialogComponent } from './translate-exercises-llm-dialog.component';
import { TranslateExercisesOptionsDialogComponent } from './translate-exercises-options-dialog.component';
import { TranslateExercisesPrintOptionsDialogComponent } from './translate-exercises-printoptions-dialog.component';
import { TranslateExercisesQuizResultComponent } from './translate-exercises-quiz-result.component';
import { TranslateExercisesQuizSessionComponent } from './translate-exercises-quiz-session.component';
import { TranslateQuizSessionStore } from './translate-exercises-quiz-session.store';
import { TranslateExercisesQuizOptionsDialogComponent } from './translate-exercises-quizoptions-dialog.component';
import { TranslateExercisesReviewSessionComponent } from './translate-exercises-review-session.component';
import { TranslateReviewSessionStore } from './translate-exercises-review-session.store';
import { TranslateExercisesReviewOptionsDialogComponent } from './translate-exercises-reviewoptions-dialog.component';
import { TranslateExercisesSelectDialogComponent } from './translate-exercises-select-dialog.component';
import { TranslateExercisesSentenceListComponent } from './translate-exercises-sentence-list.component';
import { TranslateExercisesTypingResultComponent } from './translate-exercises-typing-result.component';
import { TranslateExercisesTypingSessionComponent } from './translate-exercises-typing-session.component';
import { TranslateTypingSessionStore } from './translate-exercises-typing-session.store';

/** The screens of the sentence (translation) exercises page, switched via @switch in the template. */
export type TranslateExercisesMode = 'list' | 'review' | 'typing' | 'typingresult' | 'quiz' | 'quizresult';

@Component({
  selector: 'app-translate-exercises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FooterComponent,
    TranslateExercisesSentenceListComponent,
    TranslateExercisesReviewSessionComponent,
    TranslateExercisesTypingSessionComponent,
    TranslateExercisesTypingResultComponent,
    TranslateExercisesQuizSessionComponent,
    TranslateExercisesQuizResultComponent,
  ],
  templateUrl: './translate-exercises.component.html',
  styleUrl: './translate-exercises.component.scss',
  // Session state is shared between the session and result screens.
  providers: [
    TranslateReviewSessionStore,
    TranslateTypingSessionStore,
    TranslateQuizSessionStore,
  ],
  host: {
    class: 'app-main-content',
  },
})
export class TranslateExercisesComponent implements OnInit {
  allFiles = signal<LearningContent[]>([]);
  selectedFile = signal<LearningContent | undefined>(undefined);
  isLoadingContents = signal(true);
  // Current screen. The template switches on it via @switch; session screens
  // are added by the review/typing/quiz phases.
  mode = signal<TranslateExercisesMode>('list');
  // Table for content (rendered by the sentence-list child component, which
  // also wires the paginator/sort it owns onto this shared data source).
  dataSource: MatTableDataSource<LearnEnglishSentFileItem> = new MatTableDataSource();
  selection = new SelectionModel<LearnEnglishSentFileItem>(true, []);
  // Ratings of the loaded file's items. Replaced (not mutated) on every update
  // so the new reference reaches the OnPush sentence-list child as an input.
  contentRatingMap = signal(new Map<number, number>());
  // Filter bar: the container is the single source of truth for the applied
  // condition definition (it opens the shared filter dialog). freeText is fed
  // back from the child's live input via freeTextChanged.
  freeText = signal('');
  filterDefinition = signal<FilterRoot>(emptyFilterDefinition());
  // Parsed form of the active list filter; applyListFilter keeps it in sync
  // with dataSource.filter so the row predicate does not JSON.parse per row.
  // Null means no filter (MatTable skips the predicate for an empty filter).
  private listFilterCriteria: SentenceListFilter | null = null;
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Service
  private readonly contentService = inject(LearningContentService);
  readonly dialog = inject(MatDialog);
  private readonly ratingService = inject(LearningRatingService);
  private readonly destroyRef = inject(DestroyRef);
  readonly audio = inject(AudioService);
  private readonly aiutil = inject(AIService);
  readonly uiService = inject(UIService);
  // Navigation
  readonly router = inject(Router);
  // Maps selected file index to backend ContentId
  studyContentId = 0;
  // Latest rating the user requested per item in the list view; upsert
  // responses that arrive out of order are dropped against this map.
  private pendingContentRatings = new Map<number, number>();
  // Monotonic token of the current file load. Rapid file switches are
  // last-click-wins: a slow response from a previous file must not overwrite
  // the newly selected file's data/ratings (both loads compare against it).
  private fileLoadToken = 0;
  // Print options.
  printSetting: TranslateExercisePrintOption = {
    printAnswer: false,
    printWord: false,
    printEntryDate: false,
    direction: TranslateDirectionEnum.EnglishToChinese,
    countOfItems: 20,
  };
  // Typing options (session state itself lives in typingStore).
  typingSetting: TranslateExerciseOption = {
    countOfItems: 20,
    direction: TranslateDirectionEnum.EnglishToChinese,
  };
  // Typing session state/behavior; provided on this component so the typing
  // and result screens share one instance.
  readonly typingStore = inject(TranslateTypingSessionStore);
  // Review options (session state itself lives in reviewStore).
  reviewSetting: SentenceReviewOption = {
    countOfItems: 20,
    disableVoice: false,
  };
  // Review session state/behavior; provided on this component so the review
  // screen and the container share one instance.
  readonly reviewStore = inject(TranslateReviewSessionStore);
  // Quiz options (session state itself lives in quizStore).
  quizSetting: SentenceQuizOption = {
    countOfItems: 20,
  };
  // Quiz session state/behavior; provided on this component so the quiz and
  // result screens share one instance.
  readonly quizStore = inject(TranslateQuizSessionStore);

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
   * describing what the exercises will use (see getVisibleData).
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
    // The stores cannot switch screens; when the last sentence is submitted
    // or the last question answered, move to the result screen here.
    effect(() => {
      if (this.typingStore.isComplete() && this.mode() === 'typing') {
        this.mode.set('typingresult');
      }
    });
    effect(() => {
      if (this.quizStore.isComplete() && this.mode() === 'quiz') {
        this.mode.set('quizresult');
      }
    });

    this.dataSource.sortingDataAccessor = (
      data: LearnEnglishSentFileItem,
      sortHeaderId: string
    ): string | number => {
      if (sortHeaderId === 'rating') {
        return this.getRating(data.id);
      }
      if (sortHeaderId === 'id') {
        const numId = typeof data.id === 'string' ? parseInt(data.id, 10) : (data.id ?? 0);
        return isNaN(numId) ? 0 : numId;
      }
      if (sortHeaderId === 'ensent' || sortHeaderId === 'cnsent') {
        return data[sortHeaderId] ?? '';
      }
      if (sortHeaderId === 'enwords') {
        return data.enwords?.join(' ') ?? '';
      }
      return '';
    };
    // Filter bar criteria travel through MatTableDataSource's single string
    // channel as JSON; applyListFilter parses it once into listFilterCriteria
    // (the rating lives in contentRatingMap, so the predicate closes over
    // `this` to reach both via getRating).
    this.dataSource.filterPredicate = (
      data: LearnEnglishSentFileItem
    ): boolean =>
      matchSentenceListFilter(data, this.getRating(data.id), this.listFilterCriteria!);
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Sentences';

    this.contentService
      .getSentenceContents()
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

  applyListFilter(criteria: SentenceListFilter) {
    // Parsed once here; the row predicate reads this field instead of
    // JSON.parse-ing the filter string for every row.
    this.listFilterCriteria = isSentenceListFilterEmpty(criteria) ? null : criteria;
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

  onDefineFilter(): void {
    openFilterDialog(this.dialog, {
      destroyRef: this.destroyRef,
      properties: SENTENCE_FILTER_PROPERTIES,
      current: this.filterDefinition(),
      onApplied: root => {
        this.filterDefinition.set(root);
        this.applyCurrentFilter();
      },
    });
  }

  onClearFilter(): void {
    this.filterDefinition.set(emptyFilterDefinition());
    this.applyCurrentFilter();
  }

  /**
   * Clear the table selection from the Selection menu. Mirrors the
   * selection.clear() calls used on file switch / toggle-all: drops every
   * selected row so the exercises no longer act on a stale selection.
   */
  onClearSelection(): void {
    this.selection.clear();
  }

  /**
   * Select every row the table currently shows (Selection ▾ > Select All
   * Visible). Replaces any previous selection so hidden rows never leak into
   * the exercises.
   */
  onSelectAllVisible(): void {
    this.selection.setSelection(...this.getVisibleData());
  }

  /**
   * Quick selection from the filter bar. Random reuses Free Selection (count
   * on a shuffled source), Sequence reuses By Count (count + offset on the
   * sorted source); both open the shared select dialog.
   */
  onQuickSelect(mode: 'random' | 'sequence'): void {
    this.onSelect(mode === 'random' ? SelectionModeEnum.FreeSelection : SelectionModeEnum.ByCount);
  }

  private applyCurrentFilter(): void {
    this.applyListFilter({
      freeText: this.freeText(),
      root: this.filterDefinition(),
    });
  }

  getRating(itemId: string | undefined): number {
    const numId = ratingItemKey(itemId);
    return numId === undefined ? 0 : (this.contentRatingMap().get(numId) ?? 0);
  }

  onContentRatingChanged(item: LearnEnglishSentFileItem, event: MatButtonToggleChange) {
    if (event.value === undefined || event.value === null || event.value < 1) {
      // Clicking the active toggle deselects it (value becomes undefined).
      // There is no "clear rating" operation, so restore the previous selection.
      event.source.buttonToggleGroup.value = event.source.value;
      return;
    }
    if (this.studyContentId <= 0 || item.id === undefined) {
      return;
    }
    const numId = ratingItemKey(item.id);
    if (numId === undefined) {
      return;
    }

    this.pendingContentRatings.set(numId, event.value);
    this.ratingService
      .upsertRating(this.studyContentId, numId, event.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          // Drop stale responses: a newer click on the same item is already
          // in flight and its response will set the final value.
          if (this.pendingContentRatings.get(numId) !== event.value) {
            return;
          }
          this.contentRatingMap.update(m => new Map(m).set(numId, saved.rating));
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
          if (this.pendingContentRatings.get(numId) !== event.value) {
            return;
          }
          this.pendingContentRatings.delete(numId);
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
    // no longer relevant and would otherwise keep the exercise buttons
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
    // the previous file's ratings.
    this.contentRatingMap.set(new Map());

    this.contentService
      .getSentenceFileContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (df?: LearnEnglishSentFileItem[]) => {
          // A newer selection superseded this load.
          if (token !== this.fileLoadToken) {
            return;
          }
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
          // the in-flight ratings load for this file is discarded too.
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
            // next change — mirrors the success path.
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

  onPlayTTS(sent: string) {
    this.aiutil
      .getTTS(sent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          void this.audio.playSound(data.audioFileUrl as string, false);
        },
        error: err => {
          console.error(err);
        },
      });
  }

  onLLMExplain(sent: string) {
    this.dialog.open(TranslateExercisesLLMDialogComponent, {
      data: {
        orgsent: sent,
      },
      width: '800px',
      height: '570px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }

  onShowExplanation(explanation?: string) {
    this.dialog.open(TranslateExercisesInfoDialogComponent, {
      data: {
        titleKey: 'common.explanation',
        content: explanation || '',
      },
      width: '600px',
      height: '400px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }

  onShowExtraInfo(extraInfo?: string[]) {
    this.dialog.open(TranslateExercisesInfoDialogComponent, {
      data: {
        titleKey: 'common.extraInfo',
        content: extraInfo ? extraInfo.join('\n\n') : '',
      },
      width: '800px',
      height: '600px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }

  onPrintWithOptions() {
    const dialogRef = this.dialog.open(TranslateExercisesPrintOptionsDialogComponent, {
      data: {
        reciteQueuesCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
      },
      width: '600px',
      height: '420px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.printSetting.printAnswer = result.printAnswer;
          this.printSetting.printWord = result.printWord;
          this.printSetting.direction = result.direction;
          this.printSetting.countOfItems = result.countOfItems;
          this.printSetting.printEntryDate = result.printEntryDate;
          this.printSetting.respectRetentionCurve = result.respectRetentionCurve;
          this.printSetting.printExecDate = result.printExecDate;
          if (this.printSetting.printExecDate) {
            this.printSetting.execDate = result.execDate;
          } else {
            this.printSetting.execDate = undefined;
          }

          this.onPrint();
        }
      });
  }

  /**
   * Hand the visible (or selected) sentences to the shared print renderer:
   * explicit table selection wins, otherwise the filtered rows run through
   * prepareSentenceQueue so the filter bar keeps describing what prints.
   */
  onPrint() {
    let source: LearnEnglishSentFileItem[];
    if (this.selection.selected.length > 0) {
      source = this.selection.selected.slice();
    } else {
      source = this.prepareSentenceQueue(this.getVisibleData(), this.printSetting.countOfItems);
    }

    const items: KnowledgeExerciseFileContent[] = source.map((item, idx) => {
      const nidx = idx + 1;
      const wordText = item.enwords?.join(', ') ?? '';
      const question =
        this.printSetting.direction === TranslateDirectionEnum.EnglishToChinese
          ? `${this.printSetting.printWord ? '(' + wordText + ')' : ''}${item.ensent} @${item.cnsent}@`
          : `${this.printSetting.printWord ? '(' + wordText + ')' : ''}${item.cnsent} @${item.ensent}@`;
      return {
        id: nidx.toString(),
        order: nidx,
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question,
      };
    });
    const execPrintSetting: KnowledgeExercisePrintOption = {
      formTitle: this.selectedFile()?.nameEnglish ?? 'Translate Exercises',
      printEntryDate: true,
      printScore: true,
      printAnswer: this.printSetting.printAnswer,
      printHintOfAnswer: false,
      printID: false,
      hideLabelOfQuestionType: [QuestionBankTypeEnum.FillInTheBlank],
    };
    this.uiService.setSelectedExerciseItem(items, execPrintSetting);
    void this.router.navigate(['/knowledge/displayv2']);
  }

  onTypingWithOptions() {
    const dialogRef = this.dialog.open(TranslateExercisesOptionsDialogComponent, {
      data: {
        reciteQueuesCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        currentSettings: this.typingSetting,
      },
      width: '500px',
      height: '360px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.typingSetting.direction = result.direction;
          this.typingSetting.countOfItems = result.countOfItems;

          this.onTypingStart();
        }
      });
  }

  /**
   * Build the typing queue: explicit table selection wins, otherwise the
   * filtered rows run through prepareSentenceQueue so the filter bar keeps
   * describing what the session uses.
   */
  onTypingStart() {
    let source: LearnEnglishSentFileItem[];
    if (this.selection.selected.length > 0) {
      source = this.selection.selected.slice();
    } else {
      source = this.prepareSentenceQueue(this.getVisibleData(), this.typingSetting.countOfItems);
    }

    // Nothing to type (e.g. a filter excluded every sentence): stay on the list.
    if (this.typingStore.start(this.coverContentToQueue(source), this.typingSetting.direction)) {
      this.mode.set('typing');
    }
  }

  /**
   * Leave the typing session (quit mid-session or back from the result
   * screen): drop every piece of typing state, then return to the list.
   */
  onQuitTyping() {
    this.typingStore.reset();
    this.mode.set('list');
  }

  onReviewWithOptions() {
    const dialogRef = this.dialog.open(TranslateExercisesReviewOptionsDialogComponent, {
      data: {
        sentenceQueueCount:
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
          this.reviewSetting.countOfItems = result.countOfItems;

          this.onReviewCore();
        }
      });
  }

  // Review: queue prep stays here (it needs the table's selection/filter); the
  // session itself lives in reviewStore.
  onReviewCore() {
    let sourceItems: LearnEnglishSentFileItem[] = [];
    if (this.selection.selected.length > 0) {
      // Randomize the array
      sourceItems = FisherYatesShuffle(this.selection.selected.slice());
    } else {
      sourceItems = this.prepareSentenceQueue(
        this.getVisibleData(),
        this.reviewSetting.countOfItems
      );
    }

    const queue: SentenceReviewQueueItem[] = sourceItems.map(val => ({
      ensent: val.ensent,
      cnsent: val.cnsent,
      rating: 0,
      itemId: ratingItemKey(val.id),
    }));

    // Nothing to review (e.g. a filter excluded every sentence): stay on the list.
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

  onQuizWithOptions() {
    const dialogRef = this.dialog.open(TranslateExercisesQuizOptionsDialogComponent, {
      data: {
        sentenceQueueCount:
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
          this.quizSetting.countOfItems = result.countOfItems;

          this.onQuizStart();
        }
      });
  }

  /**
   * Build cloze questions for the quiz: the queue follows the same selection
   * mechanism as Review (explicit table selection, otherwise the filtered rows
   * run through prepareSentenceQueue), and the distractor pool is the visible
   * rows so the filter bar keeps describing what the quiz uses.
   */
  onQuizStart() {
    const visible = this.getVisibleData();
    // Distractor pool: the visible (filtered) rows, so the filter bar keeps
    // describing what the quiz uses. Fall back to the whole file when a stale
    // selection outlives the filter that produced it (visible empty).
    const pool = visible.length > 0 ? visible : this.dataSource.data.slice();
    let sourceItems: LearnEnglishSentFileItem[];
    if (this.selection.selected.length > 0) {
      // Randomize the array
      sourceItems = FisherYatesShuffle(this.selection.selected.slice());
    } else {
      sourceItems = this.prepareSentenceQueue(visible, this.quizSetting.countOfItems);
    }

    const questions = buildSentenceQuizQuestions(sourceItems, pool);

    // Nothing to ask (e.g. a filter excluded every sentence, or every visible
    // row shares one explanation): stay on the list.
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

  private coverContentToQueue(content: LearnEnglishSentFileItem[]): TranslateQueue[] {
    return content.map(item => ({
      ensent: item.ensent,
      cnsent: item.cnsent,
      enwords: item.enwords,
      completed: false,
      inputted: '',
    }));
  }

  /**
   * Rows the table currently shows: filteredData when a filter is active.
   * Exercise queue prep and selection strategies consume this so the table
   * filter always describes what the exercises will use.
   */
  private getVisibleData(): LearnEnglishSentFileItem[] {
    return this.dataSource.filter ? this.dataSource.filteredData : this.dataSource.data.slice();
  }
  /**
   * Shared queue-prep pipeline for the exercises when no table rows are
   * selected: only when over the limit, shuffle and cap to countOfItems.
   * Never mutates `items` (shuffle/slice produce new arrays).
   */
  private prepareSentenceQueue<T>(items: T[], countOfItems: number): T[] {
    let queues = items;
    if (queues.length > countOfItems) {
      // Randomize the array, then keep only the first `countOfItems` items
      queues = FisherYatesShuffle(queues);
      queues = queues.slice(0, countOfItems);
    }

    return queues;
  }

  /** Returns the visible (filtered) rows in the current sort order (mirrors MatSort behavior). */
  private getSortedData(): LearnEnglishSentFileItem[] {
    // The MatSort instance lives in the sentence-list child, which wires it
    // onto this shared data source. Selection strategies consume the same rows
    // the table shows, so start from the filtered set.
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

  private onSelect(mode: SelectionModeEnum) {
    const dialogRef = this.dialog.open(TranslateExercisesSelectDialogComponent, {
      // rowCount bounds By Count's offset. A snapshot of the visible (filtered)
      // rows, so the dialog's validation matches what selection will act on.
      data: {
        mode,
        rowCount: this.visibleRowCount,
      },
      width: '400px',
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
   * Apply a VocabularySelectOption produced by the select dialog. Each mode
   * maps to its selection strategy; Free Selection is By Count on a shuffled
   * source with offset 0.
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
          this.applyCountSelection(FisherYatesShuffle(this.getVisibleData()), 0, count);
        }
        break;
      }
      case SelectionModeEnum.ByID:
        // The sentence select dialog never offers by-word selection.
        break;
    }
  }

  /**
   * Select `count` items from `source` starting at `offset` (window [offset, offset+count)).
   * Backs both By Count (sorted source) and Free Selection (shuffled source, offset 0) -
   * the two modes differ only in the source array and whether offset is exposed.
   */
  private applyCountSelection(
    source: LearnEnglishSentFileItem[],
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
}
