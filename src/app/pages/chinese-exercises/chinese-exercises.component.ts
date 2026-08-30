import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  Component,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import type { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FisherYatesShuffle, type IFilterDefinition } from 'actslib';

import type {
  ChineseListFilter,
  ChineseReciteOption,
  ChineseRecitePrintOption,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  LearnChineseFileItem,
  LearningContent,
  VocabularySelectOption,
} from '../../interfaces';
import {
  CHINESE_FILTER_PROPERTIES,
  QuestionBankItemLevelEnum,
  QuestionBankTypeEnum,
  SelectionModeEnum,
  convertChineseReciteItemToKnowledge,
  emptyChineseFilterDefinition,
  getQuestionBankLevelName,
  isChineseListFilterEmpty,
  matchChineseListFilter,
} from '../../interfaces';
import { LearningContentService, LearningRatingService, UIService } from '../../services';
import type {
  FilterDialogData,
  FilterDialogResult,
} from '../../shared/filter-dialog/filter-dialog-model';
import { SharedFilterDialogComponent } from '../../shared/filter-dialog/filter-dialog.component';
import { FooterComponent } from '../../shared/footer/footer';
import { AppPageTitle } from '../page-title/page-title';

import { ChineseExercisesListComponent } from './chinese-exercises-list.component';
import { ChineseExercisesOptionsDialogComponent } from './chinese-exercises-options-dialog.component';
import { ChineseExercisesPrintOptionsDialogComponent } from './chinese-exercises-printoptions-dialog.component';
import { ChineseExercisesSelectDialogComponent } from './chinese-exercises-select-dialog.component';

@Component({
  selector: 'app-chinese-exercises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FooterComponent, ChineseExercisesListComponent],
  templateUrl: './chinese-exercises.component.html',
  styleUrl: './chinese-exercises.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class ChineseExercisesComponent implements OnInit {
  allFiles = signal<LearningContent[]>([]);
  selectedFile = signal<LearningContent | undefined>(undefined);
  isLoadingContents = signal(true);
  // Table for content (rendered by the list child component, which also wires
  // the paginator/sort it owns onto this shared data source).
  dataSource: MatTableDataSource<LearnChineseFileItem> = new MatTableDataSource();
  selection = new SelectionModel<LearnChineseFileItem>(true, []);
  // Ratings of the loaded file's items. Replaced (not mutated) on every update
  // so the new reference reaches the OnPush list child as an input.
  contentRatingMap = signal(new Map<number, number>());
  // Filter bar: the container is the single source of truth for the applied
  // condition definition (it opens the shared filter dialog). freeText is fed
  // back from the child's live input via freeTextChanged.
  freeText = signal('');
  filterDefinition = signal<IFilterDefinition>(emptyChineseFilterDefinition());
  // Parsed form of the active list filter; applyListFilter keeps it in sync
  // with dataSource.filter so the row predicate does not JSON.parse per row.
  // Null means no filter (MatTable skips the predicate for an empty filter).
  private listFilterCriteria: ChineseListFilter | null = null;
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Service
  private readonly contentService = inject(LearningContentService);
  readonly dialog = inject(MatDialog);
  private readonly ratingService = inject(LearningRatingService);
  private readonly destroyRef = inject(DestroyRef);
  readonly uiService = inject(UIService);
  // Navigation
  readonly router = inject(Router);
  // Maps selected file to backend ContentId
  studyContentId = 0;
  // Latest rating the user requested per item in the list view; upsert
  // responses that arrive out of order are dropped against this map.
  private pendingContentRatings = new Map<number, number>();
  // Monotonic token of the current file load. Rapid file switches are
  // last-click-wins: a slow response from a previous file must not overwrite
  // the newly selected file's data/ratings (both loads compare against it).
  private fileLoadToken = 0;
  // Recite options.
  setting: ChineseReciteOption = {
    selectedLevel: QuestionBankItemLevelEnum.Full,
    allowEmptyAnswer: false,
    countOfItems: 20,
  };
  // Print options.
  printSetting: ChineseRecitePrintOption = {
    selectedLevel: QuestionBankItemLevelEnum.Full,
    countOfItems: 20,
    respectRetentionCurve: false,
    printEntryDate: false,
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
      data: LearnChineseFileItem,
      sortHeaderId: string
    ): string | number => {
      if (sortHeaderId === 'rating') {
        return this.getRating(data.id);
      }
      const validKeys: (keyof LearnChineseFileItem)[] = ['id', 'subject', 'author', 'source'];
      const key = validKeys.includes(sortHeaderId as keyof LearnChineseFileItem)
        ? (sortHeaderId as keyof LearnChineseFileItem)
        : 'subject';
      const value = data[key];
      return typeof value === 'string' ? value.toLowerCase() : (value ?? 0);
    };
    // Filter bar criteria travel through MatTableDataSource's single string
    // channel as JSON; applyListFilter parses it once into listFilterCriteria
    // (the rating lives in contentRatingMap, so the predicate closes over
    // `this` to reach both via getRating).
    this.dataSource.filterPredicate = (
      data: LearnChineseFileItem
    ): boolean =>
      matchChineseListFilter(data, this.getRating(data.id), this.listFilterCriteria!);
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Chinese';

    this.contentService
      .getChineseContents()
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

  applyListFilter(criteria: ChineseListFilter) {
    // Parsed once here; the row predicate reads this field instead of
    // JSON.parse-ing the filter string for every row.
    this.listFilterCriteria = isChineseListFilterEmpty(criteria) ? null : criteria;
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
            properties: CHINESE_FILTER_PROPERTIES,
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
    this.filterDefinition.set(emptyChineseFilterDefinition());
    this.applyCurrentFilter();
  }

  private applyCurrentFilter(): void {
    this.applyListFilter({
      freeText: this.freeText(),
      root: this.filterDefinition(),
    });
  }

  // ── Ratings ─────────────────────────────────────────────────────

  getRating(itemId: number | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    return this.contentRatingMap().get(itemId) ?? 0;
  }

  onContentRatingChanged(item: LearnChineseFileItem, event: MatButtonToggleChange) {
    if (event.value === undefined || event.value === null || event.value < 1) {
      // Clicking the active toggle deselects it (value becomes undefined).
      // There is no "clear rating" operation, so restore the previous selection.
      event.source.buttonToggleGroup.value = event.source.value;
      return;
    }
    if (this.studyContentId <= 0 || item.id === undefined) {
      return;
    }
    const itemId = item.id;

    this.pendingContentRatings.set(itemId, event.value);
    this.ratingService
      .upsertRating(this.studyContentId, itemId, event.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          // Drop stale responses: a newer click on the same item is already
          // in flight and its response will set the final value.
          if (this.pendingContentRatings.get(itemId) !== event.value) {
            return;
          }
          this.pendingContentRatings.delete(itemId);
          this.contentRatingMap.update(m => new Map(m).set(itemId, saved.rating));
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
          if (this.pendingContentRatings.get(itemId) !== event.value) {
            return;
          }
          this.pendingContentRatings.delete(itemId);
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
      .getChineseFileContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (df?: LearnChineseFileItem[]) => {
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

  // ── Selection ───────────────────────────────────────────────────

  /**
   * Rows the table currently shows: filteredData when a filter is active.
   * Exercise queues and selection strategies consume this so the table
   * filter always describes what the exercises will use.
   */
  private getVisibleData(): LearnChineseFileItem[] {
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
   * sorted source); both open the shared select dialog.
   */
  onQuickSelect(mode: 'random' | 'sequence'): void {
    this.onSelect(mode === 'random' ? SelectionModeEnum.FreeSelection : SelectionModeEnum.ByCount);
  }

  private onSelect(mode: SelectionModeEnum) {
    const dialogRef = this.dialog.open(ChineseExercisesSelectDialogComponent, {
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
        // The Chinese select dialog never offers by-word selection.
        break;
    }
  }

  /**
   * Select `count` items from `source` starting at `offset` (window [offset, offset+count)).
   * Backs both By Count (sorted source) and Free Selection (shuffled source, offset 0) -
   * the two modes differ only in the source array and whether offset is exposed.
   */
  private applyCountSelection(
    source: LearnChineseFileItem[],
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
  private getSortedData(): LearnChineseFileItem[] {
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

  // ── Exercises ───────────────────────────────────────────────────

  private getDefaultFormTitle(): string {
    return 'Chinese Exercises';
  }

  onStartWithOptions() {
    const dialogRef = this.dialog.open(ChineseExercisesOptionsDialogComponent, {
      data: {
        reciteContentCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        disableCount: this.selection.selected.length > 0 ? true : false,
        translationDisabled: this.selectedFile()?.translationDisabled,
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
          this.setting.selectedLevel = result.selectedLevel;
          this.setting.allowEmptyAnswer = result.allowEmptyAnswer;
          this.setting.countOfItems = result.countOfItems;

          this.onStart();
        }
      });
  }

  onStart() {}

  onPrintWithOptions() {
    const dialogRef = this.dialog.open(ChineseExercisesPrintOptionsDialogComponent, {
      data: {
        reciteContentCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.visibleRowCount,
        disableCount: this.selection.selected.length > 0 ? true : false,
        translationDisabled: this.selectedFile()?.translationDisabled,
      },
      width: '600px',
      height: '560px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.printSetting.selectedLevel = result.selectedLevel;
          this.printSetting.countOfItems = result.countOfItems;
          this.printSetting.printEntryDate = result.printEntryDate;
          this.printSetting.answerLineBreakPerItem = result.answerLineBreakPerItem;
          this.printSetting.respectRetentionCurve = result.respectRetentionCurve;
          this.printSetting.printExecDate = result.printExecDate;
          this.printSetting.execDate = result.execDate;

          this.onPrint();
        }
      });
  }

  onPrint() {
    const file = this.selectedFile();
    // Check whether there are selections
    const numSelected = this.selection.selected.length > 0 ? this.selection.selected.length : 0;
    let printqueues: KnowledgeExerciseFileContent[] = [];
    if (numSelected > 0) {
      printqueues = convertChineseReciteItemToKnowledge(
        this.selection.selected,
        file?.version,
        this.printSetting.selectedLevel
      );
      printqueues = FisherYatesShuffle(printqueues);
    } else {
      printqueues = convertChineseReciteItemToKnowledge(
        this.getVisibleData(),
        file?.version,
        this.printSetting.selectedLevel
      );

      if (printqueues.length > this.printSetting.countOfItems) {
        // Randomize the array
        printqueues = FisherYatesShuffle(printqueues);
        // Keep only required items
        printqueues = printqueues.slice(0, this.printSetting.countOfItems);
      }
    }
    for (let i = 0; i < printqueues.length; i++) {
      printqueues[i].order = i + 1;
      printqueues[i].id = (i + 1).toString();
    }

    // Prepare the printing
    const execPrintSetting: KnowledgeExercisePrintOption = {
      formTitle: file?.nameChinese ? file.nameChinese : this.getDefaultFormTitle(),
      printEntryDate: true,
      printScore: true,
      printAnswer: true,
      printID: false,
      printHintOfAnswer: false,
      hideLabelOfQuestionType: [QuestionBankTypeEnum.FillInTheBlank],
      answerLineBreakPerItem: this.printSetting.answerLineBreakPerItem ?? false,
    };
    execPrintSetting.formTitle = `${execPrintSetting.formTitle} (${getQuestionBankLevelName(this.printSetting.selectedLevel)})`;
    this.uiService.setSelectedExerciseItem(printqueues, execPrintSetting);
    void this.router.navigate(['/knowledge/displayv2']);
  }
}
