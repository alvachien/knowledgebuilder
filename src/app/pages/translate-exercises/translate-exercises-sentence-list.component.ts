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
import type { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { FilterRoot } from 'actslib';

import type { LearnEnglishSentFileItem, LearningContent } from '../../interfaces';
import { SENTENCE_FILTER_PROPERTIES } from '../../interfaces';
import { UserCodeService, ratingItemKey } from '../../services';
import { hasActiveFilterDefinition, summarizeFilterDefinition } from '../../shared/filter-dialog';

/** Menu-label cap before the ellipsis, matching the vocabulary list. */
const FILTER_MENU_MAX_LENGTH = 40;

/**
 * List screen of the sentence (translation) exercises page: toolbar (file
 * selector), the Fiori-style filter bar (live free text + Go-applied
 * Sentence/Rating conditions) and the sentence table with paginator/sort.
 * Purely presentational — the container owns the dataSource, selection model
 * and all dialog orchestration; this component only renders them and forwards
 * user interactions as outputs. The paginator/sort wiring onto the shared
 * MatTableDataSource happens here because the corresponding elements live in
 * this template.
 */
@Component({
  selector: 'app-translate-exercises-sentence-list',
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
  templateUrl: './translate-exercises-sentence-list.component.html',
  styleUrl: './translate-exercises-sentence-list.component.scss',
})
export class TranslateExercisesSentenceListComponent implements OnInit {
  readonly allFiles = input.required<LearningContent[]>();
  readonly selectedFile = model<LearningContent | undefined>(undefined);
  readonly isLoadingContents = input.required<boolean>();
  readonly dataSource = input.required<MatTableDataSource<LearnEnglishSentFileItem>>();
  readonly selection = input.required<SelectionModel<LearnEnglishSentFileItem>>();
  readonly contentRatings = input.required<Map<number, number>>();

  // ── Filter bar ──────────────────────────────────────────────────
  // The container owns the applied condition definition (it opens the shared
  // filter dialog); this child only renders it for the menu label and
  // forwards intents. freeText is a local field for the input box, emitted
  // live.
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
  readonly quickSelect = output<'random' | 'sequence'>();
  readonly selectAllVisible = output<void>();
  readonly clearSelection = output<void>();

  readonly allRowsToggled = output<void>();
  readonly fileSelectionChanged = output<MatSelectChange>();
  readonly contentRatingChanged = output<{
    item: LearnEnglishSentFileItem;
    event: MatButtonToggleChange;
  }>();
  readonly playTts = output<string>();
  readonly llmExplain = output<string>();
  readonly showExplanation = output<string | undefined>();
  readonly showExtraInfo = output<string[] | undefined>();
  readonly translate = output<void>();
  readonly review = output<void>();
  readonly quiz = output<void>();
  readonly print = output<void>();

  /** Stable identities so mat-table's column defs only re-diff on a real flip. */
  readonly displayedColumns = [
    'select',
    'id',
    'ensent',
    'ai',
    'enwords',
    'cnsent',
    'explaination',
    'extraInfo',
    'rating',
  ];

  freeText = '';

  private readonly transloco = inject(TranslocoService);
  readonly usercode = inject(UserCodeService);

  /** Free text applies live. */
  onFreeTextChanged(): void {
    this.freeTextChanged.emit(this.freeText);
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
      SENTENCE_FILTER_PROPERTIES,
      { translate: key => this.transloco.translate(key) },
      FILTER_MENU_MAX_LENGTH
    );
  }

  private readonly destroyRef = inject(DestroyRef);

  /**
   * Live mirror of the selection size. The selection model is a shared mutable
   * object owned by the container: selection changes triggered from
   * container-side dialog flows (Random, Sequence, Select All Visible, Clear)
   * do not change any input reference, so the count is mirrored into a signal
   * that the template reads instead of poking change detection by hand.
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
    // checked.
    this.selectionCount.set(this.selection().selected.length);

    this.selection()
      .changed.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.selectionCount.set(this.selection().selected.length));
  }

  get sentenceQueueCount(): number {
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

  getRating(itemId: string | undefined): number {
    const numId = ratingItemKey(itemId);
    return numId === undefined ? 0 : (this.contentRatings().get(numId) ?? 0);
  }
}
