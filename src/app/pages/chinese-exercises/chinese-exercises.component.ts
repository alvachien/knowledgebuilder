import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  Component,
  DestroyRef,
  inject,
  Inject,
  model,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import type { MatSelectChange } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type {
  ChineseReciteStatus,
  LearnChineseFileItem,
  ChineseReciteOption,
  ChineseRecitePrintOption,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  LearningContent,
} from '../../interfaces';
import {
  ChineseReciteStatusEnum,
  QuestionBankItemLevelEnum,
  getChineseReciteItemDisplayContent,
  getAllPrintExecDateString,
  MY_DATE_FORMATS,
  getQuestionBankLevelName,
  QuestionBankTypeEnum,
  getAllQuestionBankLevelEnumValues,
  convertChineseReciteItemToKnowledge,
  RatingOperatorEnum,
} from '../../interfaces';
import { LearningContentService, LearningRatingService, UIService } from '../../services';
import { FooterComponent } from '../../shared/footer/footer';
import { fisherYatesShuffle } from '../../shared/utils/shuffle';
import { AppPageTitle } from '../page-title/page-title';

@Component({
  selector: 'app-chinese-exercises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FooterComponent,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    TranslocoModule,
  ],
  templateUrl: './chinese-exercises.component.html',
  styleUrl: './chinese-exercises.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class ChineseExercisesComponent implements OnInit {
  allFiles: LearningContent[] = [];
  selectedFile?: LearningContent;
  isLoadingContents = true;
  currentStatus: ChineseReciteStatus = {
    status: ChineseReciteStatusEnum.NotStarted,
    //level: ChineseReciteLevelEnum.Normal,
    correctCount: 0,
    incorrectCount: 0,
    totalCount: 0,
    startTime: new Date(),
    endTime: new Date(),
  };
  queueidx: number = -1; // Current Queue
  countOfInputableItems = 0; // Count of the items which allows for input.
  displayedPreviewColumns = ['select', 'id', 'subject', 'author', 'content', 'source', 'rating'];
  private contentRatingMap = new Map<number, number>();
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);

  paginator!: MatPaginator;
  @ViewChild(MatPaginator, { static: false })
  set content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.paginator = content;
      this.dataSource.paginator = this.paginator;
    }
  }
  @ViewChild(MatSort) sort?: MatSort;
  dataSource: MatTableDataSource<LearnChineseFileItem> = new MatTableDataSource();
  // Dialog
  readonly dialog = inject(MatDialog);
  readonly uiService = inject(UIService);
  readonly router = inject(Router);
  private readonly contentService = inject(LearningContentService);
  private readonly ratingService = inject(LearningRatingService);
  // Maps selected file to backend ContentId
  studyContentId = 0;
  setting: ChineseReciteOption = {
    selectedLevel: QuestionBankItemLevelEnum.Full,
    allowEmptyAnswer: false,
    countOfItems: 20,
  };
  printSetting: ChineseRecitePrintOption = {
    selectedLevel: QuestionBankItemLevelEnum.Full,
    countOfItems: 20,
    respectRetentionCurve: false,
    printEntryDate: false,
  };
  selection = new SelectionModel<LearnChineseFileItem>(true, []);
  subjectFilter = '';
  authorFilter = '';
  contentFilter = '';

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

  get isRecitingNotStarted(): boolean {
    return this.currentStatus.status === ChineseReciteStatusEnum.NotStarted;
  }
  get isRecitingInProgress(): boolean {
    return this.currentStatus.status === ChineseReciteStatusEnum.InProgress;
  }
  get isRecitingCompleted(): boolean {
    return this.currentStatus.status === ChineseReciteStatusEnum.Completed;
  }
  get reciteContentCount(): number {
    return this.dataSource.data.length;
  }

  getDisplayContentText(cont: LearnChineseFileItem): string {
    if (this.selectedFile?.version === 2) {
      return getChineseReciteItemDisplayContent(cont).replaceAll('@', '');
    }

    return getChineseReciteItemDisplayContent(cont);
  }

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

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
  }

  private getDefaultFormTitle(): string {
    return 'Chinese Exercises';
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Chinese';

    this.contentService
      .getChineseContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: contents => {
        this.allFiles = contents;
        this.isLoadingContents = false;
        // OnPush: the file list arrives in an async subscribe callback, so the
        // view is not marked dirty automatically — without this the files
        // dropdown stays empty until a later DOM event triggers detection.
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
    // Drop selection carried over from the previously loaded file.
    this.selection.clear();

    if (!event.value) {
      this.dataSource.data = [];
      this.studyContentId = 0;
      this.contentRatingMap.clear();
      return;
    }

    const selectedContent = event.value as LearningContent;
    this.studyContentId = selectedContent.id;

    this.contentService
      .getChineseFileContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (df?: LearnChineseFileItem[]) => {
        if (df) {
          this.dataSource.data = df.slice();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort!;
        }
      },
      error: err => {
        console.error(err);
      },
    });

    // Fetch ratings for this content from the API
    this.contentRatingMap.clear();
    if (this.studyContentId > 0) {
      this.ratingService
        .getRatings(this.studyContentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (ratings) => {
            for (const r of ratings) {
              if (r.itemId !== undefined) {
                this.contentRatingMap.set(r.itemId, r.rating);
              }
            }
            // OnPush: ratings arrive async; the mat-table only re-renders rows
            // when dataSource emits, so without markForCheck the rating column
            // stays at 0 until the next interaction.
            this.cdr.markForCheck();
          },
          error: err => console.error('Failed to load ratings', err),
        });
    }
  }

  getRating(itemId: number | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    return this.contentRatingMap.get(itemId) ?? 0;
  }

  onContentRatingChanged(item: LearnChineseFileItem, event: MatButtonToggleChange) {
    if (this.studyContentId <= 0 || item.id === undefined || event.value < 1) {
      return;
    }

    this.ratingService
      .upsertRating(this.studyContentId, item.id, event.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.contentRatingMap.set(item.id!, saved.rating);
          this.cdr.markForCheck();
        },
        error: err => console.error('Failed to save rating', err),
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onStartWithOptions() {
    const dialogRef = this.dialog.open(ChineseExercisesOptionsDialogComponent, {
      data: {
        reciteContentCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.dataSource.data.length,
        disableCount: this.selection.selected.length > 0 ? true : false,
        translationDisabled: this.selectedFile?.translationDisabled,
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
            : this.dataSource.data.length,
        disableCount: this.selection.selected.length > 0 ? true : false,
        translationDisabled: this.selectedFile?.translationDisabled,
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
    // Check whether there are selections
    const numSelected = this.selection.selected.length > 0 ? this.selection.selected.length : 0;
    let printqueues: KnowledgeExerciseFileContent[] = [];
    if (numSelected > 0) {
      printqueues = convertChineseReciteItemToKnowledge(
        this.selection.selected,
        this.selectedFile?.version,
        this.printSetting.selectedLevel
      );
      printqueues = fisherYatesShuffle(printqueues);
    } else {
      printqueues = convertChineseReciteItemToKnowledge(
        this.dataSource.data,
        this.selectedFile?.version,
        this.printSetting.selectedLevel
      );

      if (printqueues.length > this.printSetting.countOfItems) {
        // Randomize the array
        printqueues = fisherYatesShuffle(printqueues);
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
      formTitle: this.selectedFile?.nameChinese ? `${this.selectedFile.nameChinese}` : this.getDefaultFormTitle(),
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

  onSelectByRating() {
    const dialogRef = this.dialog.open(ChineseSelectByRatingDialogComponent, {
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
}

@Component({
  selector: 'app-chinese-exercises-options-dlg',
  templateUrl: 'chinese-exercises-options-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChineseExercisesOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChineseExercisesOptionsDialogComponent>);
  readonly selectedLevel = model(QuestionBankItemLevelEnum.Medium);
  readonly allowEmptyAnswer = model(false);
  readonly countOfItems = model(this.data.disableCount ? this.data.reciteContentCount : 20);
  readonly allLevels = getAllQuestionBankLevelEnumValues();
  getQuestionBankLevelName = getQuestionBankLevelName;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { reciteContentCount: number; disableCount: boolean; translationDisabled: boolean }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const selvl = this.selectedLevel();

    const closedata: ChineseReciteOption = {
      selectedLevel: selvl,
      countOfItems: this.countOfItems(),
      allowEmptyAnswer: this.allowEmptyAnswer(),
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-chinese-exercises-printoptions-dlg',
  templateUrl: 'chinese-exercises-printoptions-dialog.html',
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
export class ChineseExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChineseExercisesPrintOptionsDialogComponent>);

  readonly selectedLevel = model(QuestionBankItemLevelEnum.Medium);
  readonly countOfItems = model(this.data.disableCount ? this.data.reciteContentCount : 20);
  readonly printEntryDate = model(true);
  readonly answerLineBreak = model(true);
  readonly selectedExecDateModel = model<number>(0);
  readonly execDate = model(new Date());

  readonly allPrintExecDates = getAllPrintExecDateString();
  readonly allLevels = getAllQuestionBankLevelEnumValues();
  getQuestionBankLevelName = getQuestionBankLevelName;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { reciteContentCount: number; disableCount: boolean; translationDisabled: boolean }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const selvl = this.selectedLevel();

    const closedata: ChineseRecitePrintOption = {
      selectedLevel: selvl,
      countOfItems: this.countOfItems(),
      printEntryDate: this.printEntryDate(),
      answerLineBreakPerItem: this.answerLineBreak(),
      respectRetentionCurve: this.selectedExecDateModel() === 1 ? true : false,
      printExecDate: this.selectedExecDateModel() === 2 ? true : false,
      execDate: this.selectedExecDateModel() === 2 ? this.execDate() : undefined,
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-chinese-selectbyrating-dlg',
  templateUrl: 'chinese-exercises-selectbyrating-dialog.html',
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
export class ChineseSelectByRatingDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChineseSelectByRatingDialogComponent>);
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
