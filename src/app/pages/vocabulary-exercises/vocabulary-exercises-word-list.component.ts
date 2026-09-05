import type { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { MatSelectChange } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import type { MatTableDataSource} from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { FilterRoot } from 'actslib';

import type { LearnEnglishWordFileItem, LearningContent } from '../../interfaces';
import { VOCABULARY_FILTER_PROPERTIES } from '../../interfaces';
import { hasActiveFilterDefinition, summarizeFilterDefinition } from '../../shared/filter-dialog';

const BASE_DISPLAYED_COLUMNS = ['select', 'id', 'enword', 'cnword'];
const RATED_DISPLAYED_COLUMNS = [...BASE_DISPLAYED_COLUMNS, 'rating'];

/** Character cap for the Filter menu's dynamic summary (ellipsis appended). */
const FILTER_MENU_MAX_LENGTH = 40;

/**
 * List screen of the vocabulary exercises page: toolbar (file selector, select
 * menu, study/print/typing entries), the Fiori-style filter bar (live free
 * text + Go-applied word/rating conditions) and the word table with
 * paginator/sort. Purely presentational — the container owns the dataSource,
 * selection model and all dialog orchestration; this component only renders
 * them and forwards user interactions as outputs. The paginator/sort wiring
 * onto the shared MatTableDataSource happens here because the corresponding
 * elements live in this template.
 */
@Component({
  selector: 'app-vocabulary-exercises-word-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-word-list.component.html',
  styleUrl: './vocabulary-exercises-word-list.component.scss',
})
export class VocabularyExercisesWordListComponent implements OnInit {
  readonly allFiles = input.required<LearningContent[]>();
  readonly selectedFile = model<LearningContent | undefined>(undefined);
  readonly isLoadingContents = input.required<boolean>();
  readonly dataSource = input.required<MatTableDataSource<LearnEnglishWordFileItem>>();
  readonly selection = input.required<SelectionModel<LearnEnglishWordFileItem>>();
  readonly contentRatings = input.required<Map<number, number>>();
  /**
   * Whether ratings apply to the loaded file. Temp uploads (negative
   * `studyContentId`) cannot persist ratings — the container refuses the call,
   * so the rating column is hidden entirely: no stored value is displayed and
   * no toggle can latch a phantom value. Defaults to enabled for legacy callers.
   */
  readonly ratingsEnabled = input(true);

  readonly downloadTemplate = output<void>();
  readonly addFileClick = output<HTMLInputElement>();
  readonly tempFileSelected = output<Event>();
  readonly fileSelectionChanged = output<MatSelectChange>();
  readonly allRowsToggled = output<void>();
  readonly contentRatingChanged = output<{
    item: LearnEnglishWordFileItem;
    event: MatButtonToggleChange;
  }>();
  readonly review = output<void>();
  readonly worksheet = output<void>();
  readonly spelling = output<void>();
  readonly dictation = output<void>();
  readonly quiz = output<void>();

  // ── Filter bar ──────────────────────────────────────────────────
  // The container owns the applied condition definition (it opens the shared
  // filter dialog); this child only renders it for the menu labels and forwards
  // intents. freeText is a local field for the input box, emitted live.
  readonly filterDefinition = input.required<FilterRoot>();
  /**
   * Free text currently applied by the container. The container's filter
   * survives the @switch destroy/recreate of this screen (e.g. returning from
   * a session), so it seeds the input box on init — otherwise the box shows
   * empty while the table stays invisibly filtered.
   */
  readonly appliedFreeText = input('');
  readonly freeTextChanged = output<string>();
  readonly defineFilter = output<void>();
  readonly clearFilter = output<void>();
  readonly quickSelect = output<'random' | 'sequence' | 'words'>();
  readonly clearSelection = output<void>();

  /** Stable identities so mat-table's column defs only re-diff on a real flip. */
  get displayedColumns(): string[] {
    return this.ratingsEnabled() ? RATED_DISPLAYED_COLUMNS : BASE_DISPLAYED_COLUMNS;
  }

  freeText = '';

  private readonly transloco = inject(TranslocoService);

  /**
   * True while an IME composition is in progress. Intermediate pinyin
   * fragments fire `input` events; filtering those would flicker the table
   * mid-word (free text matches the Chinese gloss too), so they are
   * suppressed until compositionend delivers the final text.
   */
  private composing = false;

  /** Free text applies live, except mid-composition. */
  onFreeTextChanged(value: string): void {
    if (this.composing) {
      return;
    }
    this.freeTextChanged.emit(value);
  }

  onCompositionStart(): void {
    this.composing = true;
  }

  onCompositionEnd(value: string): void {
    this.composing = false;
    this.freeTextChanged.emit(value);
  }

  get hasFilter(): boolean {
    return hasActiveFilterDefinition(this.filterDefinition());
  }

  /** Condition-definition summary (join words and parentheses included) for the Filter menu item. */
  get filterMenuLabel(): string {
    if (!this.hasFilter) {
      return this.transloco.translate('common.filterNew');
    }
    return summarizeFilterDefinition(
      this.filterDefinition(),
      VOCABULARY_FILTER_PROPERTIES,
      { translate: key => this.transloco.translate(key) },
      FILTER_MENU_MAX_LENGTH
    );
  }

  private readonly destroyRef = inject(DestroyRef);

  /**
   * Live mirror of the selection size. The selection model is a shared mutable
   * object owned by the container: selection changes triggered from
   * container-side dialog flows (By Count, By Rating, By Filter, Clear) do not
   * change any input reference, so the count is mirrored into a signal that the
   * template reads instead of poking change detection by hand.
   */
  readonly selectionCount = signal(0);

  @ViewChild(MatPaginator, { static: false }) set content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.dataSource().paginator = content;
    }
  }
  @ViewChild(MatSort, { static: false }) set contentSort(sort: MatSort) {
    if (sort) {
      this.dataSource().sort = sort;
    }
  }

  ngOnInit(): void {
    // Restore the filter box to what the container has applied (see
    // appliedFreeText); a fresh instance starts empty otherwise.
    this.freeText = this.appliedFreeText();

    // Seed the count from the live selection: a screen re-created after a
    // session (the container's @switch destroys/recreates this child) inherits
    // the shared SelectionModel with rows already checked, but the
    // selection.changed subscription only fires on the *next* change — so
    // without this seed the toolbar shows 0 while checkboxes are visibly
    // checked (L1).
    this.selectionCount.set(this.selection().selected.length);

    this.selection()
      .changed.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.selectionCount.set(this.selection().selected.length));
  }

  get wordQueueCount(): number {
    return this.dataSource().data.length;
  }

  /** Rows the table currently shows: the filtered count when a filter is active. */
  get visibleRowCount(): number {
    return this.dataSource().filter
      ? this.dataSource().filteredData.length
      : this.dataSource().data.length;
  }

  /**
   * Whether every visible row is selected. Comparing against the visible rows
   * (not just counts) keeps the header checkbox honest when the selection also
   * contains rows the current filter hides — mirroring the container's
   * isAllSelected/toggleAllRows semantics.
   */
  isAllSelected(): boolean {
    const source = this.dataSource();
    const visible = source.filter ? source.filteredData : source.data;
    return visible.length > 0 && visible.every(row => this.selection().isSelected(row));
  }

  getRating(itemId: number | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    return this.contentRatings().get(itemId) ?? 0;
  }
}
