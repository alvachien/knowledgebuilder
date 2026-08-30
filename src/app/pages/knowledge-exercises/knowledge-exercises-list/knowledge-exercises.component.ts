import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import type { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FisherYatesShuffle, type IFilterDefinition } from 'actslib';

import type {
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  KnowledgeListFilter,
  LearningContent,
  QuestionBankItemBase,
  QuestionBankTypeKeys,
  VocabularySelectOption,
} from '../../../interfaces';
import {
  KNOWLEDGE_FILTER_PROPERTIES,
  QuestionBankTypeEnum,
  SelectionModeEnum,
  convertQuestionBankItemToMarkdown,
  convertToQuestionBankItem,
  emptyKnowledgeFilterDefinition,
  isKnowledgeListFilterEmpty,
  matchKnowledgeListFilter,
} from '../../../interfaces';
import {
  LearningContentService,
  LearningRatingService,
  UIService,
  ratingItemKey,
} from '../../../services';
import type {
  FilterDialogData,
  FilterDialogResult,
} from '../../../shared/filter-dialog/filter-dialog-model';
import { SharedFilterDialogComponent } from '../../../shared/filter-dialog/filter-dialog.component';
import { FooterComponent } from '../../../shared/footer/footer';
import { MarkdownContentComponent } from '../../../shared/markdown-content';
import { AppPageTitle } from '../../page-title/page-title';

import { KnowledgeExercisesListComponent } from './knowledge-exercises-list.component';
import { KnowledgeExercisesPrintOptionsDialogComponent } from './knowledge-exercises-printoptions-dialog.component';
import { KnowledgeExercisesSelectDialogComponent } from './knowledge-exercises-select-dialog.component';

/**
 * The screens of the knowledge exercises page. The list stays mounted (hidden
 * outside 'list' mode) so its paginator/sort state survives detail visits;
 * detail and extrainfo render on demand.
 */
export type KnowledgeExercisesMode = 'list' | 'detail' | 'extrainfo';

@Component({
  selector: 'app-knowledge-exercises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    FooterComponent,
    MarkdownContentComponent,
    KnowledgeExercisesListComponent,
    TranslocoModule,
  ],
  templateUrl: './knowledge-exercises.component.html',
  styleUrl: './knowledge-exercises.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class KnowledgeExercisesComponent implements OnInit {
  // Current screen (list table, item detail, item extra info).
  mode = signal<KnowledgeExercisesMode>('list');
  allFiles = signal<LearningContent[]>([]);
  selectedFile = signal<LearningContent | undefined>(undefined);
  isLoadingContents = signal(true);
  // Table for content (rendered by the list child component, which also wires
  // the paginator/sort it owns onto this shared data source).
  dataSource: MatTableDataSource<KnowledgeExerciseFileContent> = new MatTableDataSource();
  selection = new SelectionModel<KnowledgeExerciseFileContent>(true, []);
  // Ratings of the loaded file's items (keyed by ratingItemKey of the string
  // item id). Replaced (not mutated) on every update so the new reference
  // reaches the OnPush list child as an input.
  contentRatingMap = signal(new Map<number, number>());
  // Filter bar: the container is the single source of truth for the applied
  // condition definition (it opens the shared filter dialog). freeText is fed
  // back from the child's live input via freeTextChanged.
  freeText = signal('');
  filterDefinition = signal<IFilterDefinition>(emptyKnowledgeFilterDefinition());
  // Parsed form of the active list filter; applyListFilter keeps it in sync
  // with dataSource.filter so the row predicate does not JSON.parse per row.
  // Null means no filter (MatTable skips the predicate for an empty filter).
  private listFilterCriteria: KnowledgeListFilter | null = null;
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Service
  private readonly contentService = inject(LearningContentService);
  readonly dialog = inject(MatDialog);
  private readonly ratingService = inject(LearningRatingService);
  private readonly destroyRef = inject(DestroyRef);
  // Navigation
  readonly router = inject(Router);
  readonly uiService = inject(UIService);
  // Maps selected file to backend ContentId
  studyContentId = 0;
  // Latest rating the user requested per item in the list view; upsert
  // responses that arrive out of order are dropped against this map.
  private pendingContentRatings = new Map<number, number>();
  // Monotonic token of the current file load. Rapid file switches are
  // last-click-wins: a slow response from a previous file must not overwrite
  // the newly selected file's data/ratings (both loads compare against it).
  private fileLoadToken = 0;
  // Print options.
  printSetting: KnowledgeExercisePrintOption = {
    formTitle: '',
    printEntryDate: false,
    printScore: false,
    printAnswer: false,
    printHintOfAnswer: false,
    printID: true,
    hideLabelOfQuestionType: [],
    shuffleOptionsInSelection: true,
  };
  // Detail screen state (rendered inline by this container).
  selectedElementIdx?: number;
  selectedElement?: QuestionBankItemBase<string>;
  markdownStr: string = '';
  answerMarkdownStr: string = '';
  hintOfAnswerMarkdownStr: string = '';
  showDetailAnswer = false;
  showDetailHintOfAnswer = false;
  // Base URL for resolving relative image paths in the currently-loaded exercise JSON
  currentImageBaseUrl?: string;

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
    this.dataSource.sortingDataAccessor = (
      data: KnowledgeExerciseFileContent,
      sortHeaderId: string
    ): string | number => {
      if (sortHeaderId === 'rating') {
        return this.getRating(data.id);
      }
      switch (sortHeaderId) {
        case 'id':
          return (data.id ?? '').toLowerCase();
        case 'itemtype':
          return (data.itemTypeString ?? '').toLowerCase();
        case 'difficulty':
          return data.difficulty ?? 0;
        case 'suggestedCompletionTime':
          return data.suggestedCompletionTime ?? 0;
        case 'tags':
          return (data.tags ?? []).join(' ').toLowerCase();
        default:
          return '';
      }
    };
    // Filter bar criteria travel through MatTableDataSource's single string
    // channel as JSON; applyListFilter parses it once into listFilterCriteria
    // (the rating lives in contentRatingMap, so the predicate closes over
    // `this` to reach both via getRating).
    this.dataSource.filterPredicate = (
      data: KnowledgeExerciseFileContent
    ): boolean =>
      matchKnowledgeListFilter(data, this.getRating(data.id), this.listFilterCriteria!);
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Exercises';

    this.contentService
      .getKnowledgeBankContents()
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

  // ── Filter bar ──────────────────────────────────────────────────

  applyListFilter(criteria: KnowledgeListFilter) {
    // Parsed once here; the row predicate reads this field instead of
    // JSON.parse-ing the filter string for every row.
    this.listFilterCriteria = isKnowledgeListFilterEmpty(criteria) ? null : criteria;
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
    this.dialog
      .open<SharedFilterDialogComponent, FilterDialogData, FilterDialogResult | undefined>(
        SharedFilterDialogComponent,
        {
          data: {
            properties: KNOWLEDGE_FILTER_PROPERTIES,
            root: this.filterDefinition(),
          },
          // Tree navigator + detail pane sit side by side; the splitter can
          // resize them but needs the extra width to start from.
          width: '880px',
          enterAnimationDuration: 800,
          exitAnimationDuration: 500,
        }
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        // undefined (Cancel / backdrop / Esc) leaves the previous filter untouched.
        if (result !== undefined) {
          this.filterDefinition.set(result.root);
          this.applyCurrentFilter();
        }
      });
  }

  onClearFilter(): void {
    this.filterDefinition.set(emptyKnowledgeFilterDefinition());
    this.applyCurrentFilter();
  }

  private applyCurrentFilter(): void {
    this.applyListFilter({
      freeText: this.freeText(),
      root: this.filterDefinition(),
    });
  }

  // ── Ratings ─────────────────────────────────────────────────────

  getRating(itemId: string | number | undefined): number {
    const numId = ratingItemKey(itemId);
    return numId === undefined ? 0 : (this.contentRatingMap().get(numId) ?? 0);
  }

  onContentRatingChanged(item: KnowledgeExerciseFileContent, event: MatButtonToggleChange) {
    if (event.value === undefined || event.value === null || event.value < 1) {
      // Clicking the active toggle deselects it (value becomes undefined).
      // There is no "clear rating" operation, so restore the previous selection.
      event.source.buttonToggleGroup.value = event.source.value;
      return;
    }
    const numId = ratingItemKey(item.id);
    if (this.studyContentId <= 0 || numId === undefined) {
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
          this.pendingContentRatings.delete(numId);
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

  // ── File loading ────────────────────────────────────────────────

  onFileSelectionChanged(event: MatSelectChange) {
    // Drop any selection carried over from the previously loaded file — the
    // SelectionModel holds references to the old file's row objects, which are
    // no longer relevant and would otherwise keep the exercises acting on
    // stale rows.
    this.selection.clear();
    this.pendingContentRatings.clear();

    if (!event.value) {
      this.fileLoadToken++;
      this.dataSource.data = [];
      this.studyContentId = 0;
      this.contentRatingMap.set(new Map());
      this.currentImageBaseUrl = undefined;
      return;
    }

    const selectedContent = event.value as LearningContent;
    const contentId = selectedContent.id;
    // Rating writes stay disabled (studyContentId = 0) until the new file's
    // rows actually replace the old ones in the `next` handler below: the
    // old rows are still on screen while the load is in flight, and a click
    // in that window would otherwise upsert (newContentId, oldItemId) —
    // persisting a rating into the wrong file's namespace.
    this.studyContentId = 0;
    const token = ++this.fileLoadToken;
    // Compute the base URL for resolving relative image paths within this JSON file
    this.currentImageBaseUrl = this.contentService.getStorageFileBaseUrl(selectedContent.fileUrl);
    // Clear the rating map BEFORE subscribing to content: cached content
    // resolves synchronously, so the content `next` (which re-runs the
    // filter predicate) would otherwise filter the new file's rows against
    // the previous file's ratings.
    this.contentRatingMap.set(new Map());

    this.contentService
      .getKnowledgeExerciseContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (df?: KnowledgeExerciseFileContent[]) => {
          // A newer selection superseded this load.
          if (token !== this.fileLoadToken) {
            return;
          }
          if (df) {
            this.dataSource.data = df.slice();
            // The displayed rows now belong to this file — allow rating.
            this.studyContentId = contentId;
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
    if (contentId > 0) {
      this.ratingService
        .getRatings(contentId)
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
            // Local truth wins over the server snapshot: if a rating was
            // saved (map) or is still in flight (pending) while this
            // response — computed before it — was on the wire, rebuilding
            // from the stale list alone would visually revert the fresh
            // rating. Re-apply both on top before publishing.
            this.contentRatingMap().forEach((value, key) => newRatingMap.set(key, value));
            this.pendingContentRatings.forEach((value, key) => newRatingMap.set(key, value));
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

  // ── Selection ───────────────────────────────────────────────────

  /**
   * Rows the table currently shows: filteredData when a filter is active.
   * Exercise queues and selection strategies consume this so the table
   * filter always describes what the exercises will use.
   */
  private getVisibleData(): KnowledgeExerciseFileContent[] {
    return this.dataSource.filter ? this.dataSource.filteredData : this.dataSource.data.slice();
  }

  /**
   * Clear the table selection from the Selection menu. Drops every selected
   * row so the exercises no longer act on a stale selection.
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
   * sorted source), IDs reuses By ID (comma-separated exercise ids); all open
   * the shared select dialog.
   */
  onQuickSelect(mode: 'random' | 'sequence' | 'ids'): void {
    const selectMode =
      mode === 'random' ? SelectionModeEnum.FreeSelection
      : mode === 'sequence' ? SelectionModeEnum.ByCount
      : SelectionModeEnum.ByID;
    this.onSelect(selectMode);
  }

  private onSelect(mode: SelectionModeEnum) {
    const dialogRef = this.dialog.open(KnowledgeExercisesSelectDialogComponent, {
      // rowCount bounds By Count's offset; visibleIds lets By ID validate at
      // least one match. Both are snapshots of the visible (filtered) rows,
      // so the dialog's validation matches what selection will act on.
      data: {
        mode,
        rowCount: this.visibleRowCount,
        visibleIds: this.getVisibleData().map(item => item.id ?? ''),
      },
      // By ID needs a wider dialog for the multi-line id list.
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
      case SelectionModeEnum.ByID: {
        // By ID: match item id text against the supplied list. Normalize
        // separators (newlines/whitespace -> commas) so pasted lists work, and
        // only touch the selection when at least one token matches — a
        // no-match paste must never silently wipe the existing selection.
        const tokens = (option.importIDs ?? '')
          .split(/[\n\r,]+/)
          .map(t => t.trim())
          .filter(t => t.length > 0);
        if (tokens.length > 0) {
          const tokenSet = new Set(tokens);
          const matched = this.getVisibleData().filter(item => tokenSet.has(item.id ?? ''));
          if (matched.length > 0) {
            this.selection.clear();
            matched.forEach(item => this.selection.select(item));
          }
        }
        break;
      }
    }
  }

  /**
   * Select `count` items from `source` starting at `offset` (window [offset, offset+count)).
   * Backs both By Count (sorted source) and Free Selection (shuffled source, offset 0) -
   * the two modes differ only in the source array and whether offset is exposed.
   */
  private applyCountSelection(
    source: KnowledgeExerciseFileContent[],
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

  /** Returns the visible (filtered) rows in the current sort order (mirrors MatSort behavior). */
  private getSortedData(): KnowledgeExerciseFileContent[] {
    // The MatSort instance lives in the list child, which wires it onto this
    // shared data source. Selection strategies consume the same rows the
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

  // ── Print ───────────────────────────────────────────────────────

  onPreviewWithOptions() {
    const dialogRef = this.dialog.open(KnowledgeExercisesPrintOptionsDialogComponent, {
      data: {
        defaultTitle: this.selectedFile()?.nameChinese || '',
      },
      width: '600px',
      height: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.printSetting.formTitle = result.formTitle;
          this.printSetting.printEntryDate = result.printEntryDate;
          this.printSetting.printScore = result.printScore;
          this.printSetting.printAnswer = result.printAnswer;
          this.printSetting.printHintOfAnswer = result.printHintOfAnswer;
          this.printSetting.hideLabelOfQuestionType = result.hideLabelOfQuestionType;
          this.printSetting.shuffleOptionsInSelection = result.shuffleOptionsInSelection;

          this.onPreviewCore();
        }
      });
  }

  private onPreviewCore() {
    // Renumber on shallow copies: selection.selected holds the very row
    // objects cached by LearningContentService per fileUrl, and mutating
    // their `order` in place would leak into later visits of the same file
    // (the list renders `order`-independent columns but exercises consume
    // the cached rows directly).
    const narr = this.selection.selected.map((item, index) => {
      const copy = { ...item, order: index + 1 };
      // For reading comprehension, listening comprehension and cloze
      // They have sub items
      if (copy.items && copy.items.length > 0) {
        copy.items = copy.items.map((sbitem, sbindex) => ({ ...sbitem, order: sbindex + 1 }));
      }
      return copy;
    });

    this.uiService.setSelectedExerciseItem(
      narr,
      this.printSetting,
      this.selectedFile()?.includeLatex ?? false,
      this.currentImageBaseUrl
    );
    void this.router.navigate(['/knowledge/displayv2']);
  }

  // ── Detail / Extra Info screens ─────────────────────────────────

  onShowExtraInfo(elemid: string) {
    this.selectedElementIdx = this.getVisibleData().findIndex(item => item.id === elemid);
    if (this.selectedElementIdx !== -1) {
      // Only switch views once the element is actually found — otherwise the
      // detail view would open on the stale previously-selected element.
      this.mode.set('extrainfo');
      this.setSelectedElement();
    }
  }

  onShowDetail(elemid: string) {
    // Show the detail of the element
    this.selectedElementIdx = this.getVisibleData().findIndex(item => item.id === elemid);
    if (this.selectedElementIdx !== -1) {
      this.mode.set('detail');
      this.setSelectedElement();
    }
  }

  setSelectedElement() {
    if (this.selectedElementIdx === undefined) {
      return;
    }
    this.selectedElement = convertToQuestionBankItem(this.getVisibleData()[this.selectedElementIdx]);
    const hideLabelOfQuestionType: QuestionBankTypeKeys[] = [
      QuestionBankTypeEnum.SingleChoice,
    ];
    this.markdownStr = convertQuestionBankItemToMarkdown(
      this.selectedElement,
      hideLabelOfQuestionType
    );
    this.answerMarkdownStr =
      this.selectedElement?.getAnswers()?.join(';').replaceAll(' ', '&nbsp;') ?? '';
    this.hintOfAnswerMarkdownStr = this.buildHintMarkdown(this.selectedElement);
  }

  private buildHintMarkdown(item?: QuestionBankItemBase<string>): string {
    if (!item) {
      return '';
    }
    // For composite types, format each sub-item's hint with order prefix
    const items = item.items;
    if (items && items.length > 0) {
      const hints = items
        .filter(subItem => subItem.hasHintOfAnswer())
        .map(subItem => {
          const hint = subItem.getHintsOfAnswer();
          const hintText = hint.length > 0 ? hint[0].hint : '';
          return `*${subItem.order}*. ${hintText}`;
        });
      return hints.join('<br>');
    }
    // For simple types, return own hint
    return item.hintofanswer ? String(item.hintofanswer) : '';
  }

  getExtraInfoMarkdown(): string {
    if (!this.selectedElement?.extraInfo) {
      return '';
    }
    return Array.isArray(this.selectedElement.extraInfo)
      ? this.selectedElement.extraInfo.join('\n\n')
      : String(this.selectedElement.extraInfo);
  }

  onBackToList() {
    this.showDetailAnswer = false;
    this.showDetailHintOfAnswer = false;
    this.hintOfAnswerMarkdownStr = '';
    this.mode.set('list');
  }

  onPreviousItem() {
    if (this.selectedElementIdx === undefined) {
      return;
    }
    this.selectedElementIdx = this.selectedElementIdx - 1;
    this.setSelectedElement();
    this.hintOfAnswerMarkdownStr = '';
    this.showDetailHintOfAnswer = false;
    // Like the hint flags, the answer panel is per-item: leaving it open
    // would show the previous item's answer toggle state on the new item.
    this.showDetailAnswer = false;
  }

  onNextItem() {
    if (this.selectedElementIdx === undefined) {
      return;
    }
    this.selectedElementIdx = this.selectedElementIdx + 1;
    this.setSelectedElement();
    this.hintOfAnswerMarkdownStr = '';
    this.showDetailHintOfAnswer = false;
    this.showDetailAnswer = false;
  }

  onToggleAnswer() {
    this.showDetailAnswer = !this.showDetailAnswer;
  }
  onToggleHintOfAnswer() {
    this.showDetailHintOfAnswer = !this.showDetailHintOfAnswer;
  }
}
