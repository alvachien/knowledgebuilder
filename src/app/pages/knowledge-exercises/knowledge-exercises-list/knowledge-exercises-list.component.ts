import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  inject,
  model,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule, type MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import type { MatSelectChange } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type {
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  LearningContent,
  QuestionBankItemBase,
  QuestionBankTypeKeys,
} from '../../../interfaces';
import {
  getAllQuestionBankTypes,
  MY_DATE_FORMATS,
  convertToQuestionBankItem,
  convertQuestionBankItemToMarkdown,
  QuestionBankTypeEnum,
  RatingOperatorEnum,
} from '../../../interfaces';

interface FilterResult {
  item: KnowledgeExerciseFileContent;
  ranking: number;
}

enum ContentToDisplayEnum {
  List = 1,
  Detail = 2,
  ExtraInfo = 3,
}
import { UIService, LearningContentService, LearningRatingService } from '../../../services';
import { FooterComponent } from '../../../shared/footer/footer';
import { MarkdownContentComponent } from '../../../shared/markdown-content';
import { fisherYatesShuffle } from '../../../shared/utils/shuffle';
import { AppPageTitle } from '../../page-title/page-title';

@Component({
  selector: 'app-knowledge-exercises-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    RouterModule,
    MarkdownContentComponent,
    MatDividerModule,
    FooterComponent,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  templateUrl: './knowledge-exercises-list.component.html',
  styleUrl: './knowledge-exercises-list.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class KnowledgeExercisesListComponent implements OnInit {
  // Enum reference for template
  readonly ContentToDisplay = ContentToDisplayEnum;
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Selected file
  selectedFile?: LearningContent;
  allFiles?: LearningContent[];
  isLoadingContents = true;
  // Current content ID for rating
  private currentContentId?: number;
  // List page
  contentToDisplay = ContentToDisplayEnum.List;
  dataSource: MatTableDataSource<KnowledgeExerciseFileContent> = new MatTableDataSource();
  selection = new SelectionModel<KnowledgeExerciseFileContent>(true, []);
  paginator?: MatPaginator;
  private originalData: KnowledgeExerciseFileContent[] = [];
  @ViewChild(MatPaginator, { static: false }) set content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.paginator = content;
      this.dataSource.paginator = this.paginator;
    }
  }
  displayedColumns = [
    'select',
    'id',
    'itemtype',
    'difficulty',
    'suggestedCompletionTime',
    'tags',
    'extraInfo',
    'rating',
  ];
  // Navigation
  readonly router = inject(Router);
  readonly learningContentService = inject(LearningContentService);
  readonly uiService = inject(UIService);
  private readonly ratingService = inject(LearningRatingService);
  // Dialog
  readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  // Map to store ratings by item ID
  private contentRatingMap = new Map<number, number>();
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
  // Snackbar
  readonly _snackBar = inject(MatSnackBar);
  // Detail
  selectedElementIdx?: number;
  selectedElement?: QuestionBankItemBase<string>;
  markdownStr: string = '';
  answerMarkdownStr: string = '';
  hintOfAnswerMarkdownStr: string = '';
  showDetailAnswer = false;
  showDetailHintOfAnswer = false;
  // Base URL for resolving relative image paths in the currently-loaded exercise JSON
  currentImageBaseUrl?: string;

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  get itemCount(): number {
    return this.dataSource.data.length;
  }

  ngOnInit(): void {
    // Set the page title
    this.pageTitle.title = 'Exercises';
    // Fetch knowledge bank contents from the API. The includeLatex flag is carried on
    // each LearningContent record, so no separate metadata index load is needed.
    this.learningContentService
      .getKnowledgeBankContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: contents => {
          this.allFiles = contents;
          this.isLoadingContents = false;
          // OnPush: the file list arrives in an async subscribe callback, so
          // the view is not marked dirty automatically — without this the
          // files dropdown stays empty until a later DOM event triggers
          // detection.
          this.cdr.markForCheck();
        },
        error: err => {
          console.error(err);
          this.isLoadingContents = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFileSelectionChanged(event: MatSelectChange) {
    if (!event.value) {
      this.originalData = [];
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator || null;
      this.contentRatingMap.clear();
      this.currentContentId = undefined;
      return;
    }

    const selectedContent = event.value as LearningContent;
    this.currentContentId = selectedContent.id;

    // Compute the base URL for resolving relative image paths within this JSON file
    this.currentImageBaseUrl = this.learningContentService.getStorageFileBaseUrl(selectedContent.fileUrl);

    this.dataSource.data = [];
    this.selection.clear();
    this.contentRatingMap.clear();

    this.learningContentService
      .getKnowledgeExerciseContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: df => {
        if (df) {
          this.originalData = df.slice();
          this.dataSource.data = df.slice();
          this.dataSource.paginator = this.paginator || null;

          // Load ratings for this content
          if (this.currentContentId) {
            this.ratingService
              .getRatings(this.currentContentId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: ratings => {
                  for (const r of ratings) {
                    if (r.itemId !== undefined) {
                      this.contentRatingMap.set(r.itemId, r.rating);
                    }
                  }
                  // OnPush: ratings arrive async; the mat-table only re-renders
                  // rows when dataSource emits, so without markForCheck the
                  // rating column stays at 0 until the next interaction.
                  this.cdr.markForCheck();
                },
                error: err => console.error('Failed to load ratings', err),
              });
          }
        }
      },
      error: err => {
        console.error(err);
      },
    });
  }

  getRating(itemId: string | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    const numId = parseInt(itemId, 10);
    return isNaN(numId) ? 0 : (this.contentRatingMap.get(numId) ?? 0);
  }

  onContentRatingChanged(item: KnowledgeExerciseFileContent, event: MatButtonToggleChange) {
    if (this.currentContentId === undefined || item.id === undefined || event.value < 1) {
      return;
    }
    const numId = parseInt(item.id, 10);
    if (isNaN(numId)) {
      return;
    }

    this.ratingService
      .upsertRating(this.currentContentId, numId, event.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => {
          this.contentRatingMap.set(numId, saved.rating);
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to save rating', err);
          this.contentRatingMap.delete(numId);
          this.cdr.markForCheck();
        },
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const filterTerms = filterValue
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 0);

    if (filterTerms.length === 0) {
      this.dataSource.data = this.originalData.slice();
      this.dataSource.paginator = this.paginator || null;
      return;
    }

    const results: FilterResult[] = this.originalData
      .map(item => {
        const ranking = this.calculateRanking(item, filterTerms);
        return { item, ranking };
      })
      .filter(result => result.ranking > 0);

    results.sort((a, b) => b.ranking - a.ranking);

    this.dataSource.data = results.map(r => r.item);
    this.dataSource.paginator = this.paginator || null;
  }

  private calculateRanking(item: KnowledgeExerciseFileContent, filterTerms: string[]): number {
    let totalRanking = 0;

    const fieldPriorities: Array<{
      getValue: (i: KnowledgeExerciseFileContent) => string | string[] | undefined;
      weight: number;
    }> = [
      { getValue: i => i.id, weight: 8 },
      { getValue: i => i.question, weight: 7 },
      { getValue: i => i.tags, weight: 6 },
      { getValue: i => this.extractOptionsText(i.options), weight: 5 },
      { getValue: i => i.answer, weight: 4 },
      { getValue: i => i.answers?.join(' '), weight: 4 },
      { getValue: i => i.hintofanswer, weight: 3 },
      { getValue: i => i.extraInfo?.join(' '), weight: 2 },
      { getValue: i => this.extractItemsText(i.items), weight: 1 },
    ];

    for (const term of filterTerms) {
      let termMatched = false;

      for (const field of fieldPriorities) {
        const value = field.getValue(item);
        const textValue = Array.isArray(value)
          ? value.join(' ').toLowerCase()
          : value?.toLowerCase() || '';

        if (textValue.includes(term)) {
          totalRanking += field.weight;
          termMatched = true;
          break;
        }
      }

      if (termMatched) {
        totalRanking += 10;
      }
    }

    const matchedAllTerms = filterTerms.every(term => {
      return fieldPriorities.some(field => {
        const value = field.getValue(item);
        const textValue = Array.isArray(value)
          ? value.join(' ').toLowerCase()
          : value?.toLowerCase() || '';
        return textValue.includes(term);
      });
    });

    if (matchedAllTerms) {
      totalRanking += 100;
    }

    return totalRanking;
  }

  private extractOptionsText(options: { [key: string]: string } | undefined): string {
    if (!options) {return '';}
    return Object.values(options).join(' ');
  }

  private extractItemsText(items: KnowledgeExerciseFileContent[] | undefined): string {
    if (!items || items.length === 0) {return '';}
    return items
      .map(item => {
        const parts: string[] = [];
        if (item.question) {parts.push(item.question);}
        if (item.answer) {parts.push(item.answer);}
        if (item.answers) {parts.push(...item.answers);}
        return parts.join(' ');
      })
      .join(' ');
  }

  onShowExtraInfo(elemid: string) {
    this.contentToDisplay = ContentToDisplayEnum.ExtraInfo;

    this.selectedElementIdx = this.dataSource.data.findIndex(item => item.id === elemid);
    if (this.selectedElementIdx !== -1) {
      this.setSelectedElement();
    }
  }

  onShowDetail(elemid: string) {
    this.contentToDisplay = ContentToDisplayEnum.Detail;

    // Show the detail of the element
    this.selectedElementIdx = this.dataSource.data.findIndex(item => item.id === elemid);
    if (this.selectedElementIdx !== -1) {
      this.setSelectedElement();
    }
  }

  setSelectedElement() {
    this.selectedElement = convertToQuestionBankItem(
      this.dataSource.data[this.selectedElementIdx!]
    );
    const hideLabelOfQuestionType: QuestionBankTypeKeys[] = [QuestionBankTypeEnum.SingleChoice as QuestionBankTypeKeys];
    this.markdownStr = convertQuestionBankItemToMarkdown(this.selectedElement, hideLabelOfQuestionType);
    this.answerMarkdownStr =
      this.selectedElement?.getAnswers()?.join(';').replaceAll(' ', '&nbsp;') ?? '';
    this.hintOfAnswerMarkdownStr = this.buildHintMarkdown(this.selectedElement);
  }

  private buildHintMarkdown(item?: QuestionBankItemBase<string>): string {
    if (!item) return '';
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
    this.contentToDisplay = ContentToDisplayEnum.List;
  }

  onPreviousItem() {
    this.selectedElementIdx = this.selectedElementIdx! - 1;
    this.setSelectedElement();
    this.hintOfAnswerMarkdownStr = '';
    this.showDetailHintOfAnswer = false;
  }

  onNextItem() {
    this.selectedElementIdx = this.selectedElementIdx! + 1;
    this.setSelectedElement();
    this.hintOfAnswerMarkdownStr = '';
    this.showDetailHintOfAnswer = false;
  }

  onToggleAnswer() {
    this.showDetailAnswer = !this.showDetailAnswer;
  }
  onToggleHintOfAnswer() {
    this.showDetailHintOfAnswer = !this.showDetailHintOfAnswer;
  }

  onPreview() {
    // Show the dailog
    const dialogRef = this.dialog.open(KnowledgeExercisesPrintOptionsDialogComponent, {
      data: {
        defaultTitle: this.selectedFile?.nameChinese || '',
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

  onSelectByCount() {
    const dialogRef = this.dialog.open(KnowledgeSelectByCountDialogComponent, {
      data: {},
      width: '400px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined && result.countOfItems > 0) {
        this.selection.clear();
        const offset = result.countOfOffset ?? 0;
        this.dataSource.data.forEach((item, index) => {
          if (index >= offset && index < offset + result.countOfItems) {
            this.selection.select(item);
          }
        });
        // OnPush: the count-based selection is applied in the async
        // afterClosed callback — without markForCheck the checkboxes would
        // not reflect the new selection until a later DOM event.
        this.cdr.markForCheck();
      }
    });
  }

  onSelectByID() {
    const dialogRef = this.dialog.open(KnowledgeSelectByIDDialogComponent, {
      data: {},
      width: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined && result.importIDs) {
        // Split by the ','
        const arids = result.importIDs.split(',');
        if (arids.length > 0) {
          this.selection.clear();
          this.dataSource.data.forEach(item => {
            const selidx = arids.findIndex((idstr: string) => idstr.trim() === item.id);
            if (selidx !== -1) {
              this.selection.select(item);
            }
          });
          this.cdr.markForCheck();
        }
      }
    });
  }

  onSelectFreeSelection() {
    const dialogRef = this.dialog.open(KnowledgeSelectFreeDialogComponent, {
      data: {},
      width: '400px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined && result.countOfItems > 0) {
        // Random select
        this.selection.clear();

        let narr: KnowledgeExerciseFileContent[] = [];
        if (result.filterOnTag) {
          // Filter by tag
          narr = this.dataSource.data.filter(
            item =>
              item.tags &&
              item.tags.some(
                tag => tag.toLowerCase().indexOf(result.filterOnTag.toLowerCase()) !== -1
              )
          );
          narr = fisherYatesShuffle(narr);
        } else {
          narr = fisherYatesShuffle(this.dataSource.data);
        }

        narr.forEach((item, index) => {
          if (index < result.countOfItems) {
            this.selection.select(item);
          }
        });
        this.cdr.markForCheck();
      }
    });
  }

  onSelectByRating() {
    const dialogRef = this.dialog.open(KnowledgeSelectByRatingDialogComponent, {
      data: {},
      width: '400px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        this.selection.clear();
        const operator = result.ratingOperator as RatingOperatorEnum;
        const value = result.ratingValue as number;

        this.dataSource.data.forEach(item => {
          const rating = this.getRating(item.id);
          let matches = false;

          switch (operator) {
            case RatingOperatorEnum.Equals:
              matches = rating === value;
              break;
            case RatingOperatorEnum.GreaterThan:
              matches = rating > value;
              break;
            case RatingOperatorEnum.LargerOrEquals:
              matches = rating >= value;
              break;
            case RatingOperatorEnum.LessThan:
              // "Less than" intentionally excludes unrated (0) items: a rating
              // of 0 means "not yet assessed", which is covered by HasNone.
              // This keeps LessThan 1 from collapsing into HasNone.
              matches = rating > 0 && rating < value;
              break;
            case RatingOperatorEnum.LessOrEquals:
              // Same unrated-exclusion rationale as LessThan: an unrated (0)
              // item is "not yet assessed", not "rated at or below the value".
              matches = rating > 0 && rating <= value;
              break;
            case RatingOperatorEnum.HasAny:
              matches = rating > 0;
              break;
            case RatingOperatorEnum.HasNone:
              matches = rating === 0;
              break;
          }

          if (matches) {
            this.selection.select(item);
          }
        });
        this.cdr.markForCheck();
      }
    });
  }

  private onPreviewCore() {
    const narr = this.selection.selected.slice();
    narr.forEach((item, index) => {
      item.order = index + 1;

      // For reading comprehension, listening comprehension and cloze
      // They have sub items
      if (item.items && item.items.length > 0) {
        item.items.forEach((sbitem, sbindex) => {
          sbitem.order = sbindex + 1;
        });
      }
    });

    this.uiService.setSelectedExerciseItem(
      narr,
      this.printSetting,
      this.selectedFile?.includeLatex ?? false,
      this.currentImageBaseUrl
    );
    void this.router.navigate(['/knowledge/displayv2']);
  }
}

@Component({
  selector: 'app-knowledge-exercises-printoptions-dlg',
  templateUrl: 'knowledge-exercises-printoptions-dlg.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatDateFnsModule,
    TranslocoModule,
  ],
  providers: [
    provideDateFnsAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: zhCN },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeExercisesPrintOptionsDialogComponent>);
  private readonly _snackBar = inject(MatSnackBar);
  readonly transloco = inject(TranslocoService);

  allQuestionBankTypes = getAllQuestionBankTypes();
  readonly formTitle = model('');
  readonly printEntryDate = model(true);
  readonly printScore = model(true);
  readonly printAnswer = model(true);
  readonly printHintOfAnswer = model(false);
  readonly printID = model(true);
  readonly hideLabelOfQuestionType = model([]);
  readonly shuffleOptionsInSelection = model(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { defaultTitle: string }) {
    this.formTitle.set(data.defaultTitle);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    if (this.formTitle().trim() === '') {
      this._snackBar.open(
        this.transloco.translate('required_field'),
        this.transloco.translate('close'),
        {
          duration: 3000,
        }
      );
      return;
    }

    const closedata: KnowledgeExercisePrintOption = {
      formTitle: this.formTitle(),
      printEntryDate: this.printEntryDate(),
      printScore: this.printScore(),
      printAnswer: this.printAnswer(),
      printHintOfAnswer: this.printHintOfAnswer(),
      printID: this.printID(),
      hideLabelOfQuestionType: this.hideLabelOfQuestionType(),
      shuffleOptionsInSelection: this.shuffleOptionsInSelection(),
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-knowledge-selectbycount-dlg',
  templateUrl: 'knowledge-exercises-selectbycount-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeSelectByCountDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeSelectByCountDialogComponent>);
  readonly countOfItems = model(20);
  readonly countOfOffset = model(0);

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    return this.countOfItems() <= 0 || (this.countOfOffset() ?? 0) < 0;
  }

  onYesClick(): void {
    this.dialogRef.close({
      countOfItems: this.countOfItems(),
      countOfOffset: this.countOfOffset(),
    });
  }
}

@Component({
  selector: 'app-knowledge-selectbyid-dlg',
  templateUrl: 'knowledge-exercises-selectbyid-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeSelectByIDDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeSelectByIDDialogComponent>);
  readonly importIDs = model('');

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    return this.importIDs().trim().length <= 0;
  }

  onYesClick(): void {
    this.dialogRef.close({
      importIDs: this.importIDs(),
    });
  }
}

@Component({
  selector: 'app-knowledge-selectfree-dlg',
  templateUrl: 'knowledge-exercises-selectfree-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeSelectFreeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeSelectFreeDialogComponent>);
  readonly countOfItems = model(20);
  readonly filterOnTag = model('');

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    return this.countOfItems() <= 0;
  }

  onYesClick(): void {
    this.dialogRef.close({
      countOfItems: this.countOfItems(),
      filterOnTag: this.filterOnTag(),
    });
  }
}

@Component({
  selector: 'app-knowledge-selectbyrating-dlg',
  templateUrl: 'knowledge-exercises-selectbyrating-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeSelectByRatingDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeSelectByRatingDialogComponent>);
  readonly ratingOperator = model(RatingOperatorEnum.Equals);
  readonly ratingValue = model(3);

  get ratingOperators(): { value: RatingOperatorEnum; label: string }[] {
    return [
      { value: RatingOperatorEnum.Equals, label: 'operatorEquals' },
      { value: RatingOperatorEnum.GreaterThan, label: 'operatorGreaterThan' },
      { value: RatingOperatorEnum.LargerOrEquals, label: 'operatorLargerOrEquals' },
      { value: RatingOperatorEnum.LessThan, label: 'operatorLessThan' },
      { value: RatingOperatorEnum.LessOrEquals, label: 'operatorLessOrEquals' },
      { value: RatingOperatorEnum.HasAny, label: 'operatorHasAny' },
      { value: RatingOperatorEnum.HasNone, label: 'operatorHasNone' },
    ];
  }

  get ratingValues(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get isValueDisabled(): boolean {
    return this.ratingOperator() === RatingOperatorEnum.HasAny ||
           this.ratingOperator() === RatingOperatorEnum.HasNone;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close({
      ratingOperator: this.ratingOperator(),
      ratingValue: this.ratingValue(),
    });
  }
}
