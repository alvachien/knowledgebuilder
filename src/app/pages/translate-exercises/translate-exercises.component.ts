import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, DestroyRef, inject, Inject, model, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import type { MatSelectChange } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type {
  TranslateExerciseUIStatus,
  TranslateQueue,
  TranslateExercisePrintOption,
  LearningContent,
  LearnEnglishSentFileItem,
  TranslateExerciseOption,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  UserLearningRating,
} from '../../interfaces';
import {
  TranslateExerciseStatusEnum,
  TranslateDirectionEnum,
  TranslationAIModeEnum,
  MY_DATE_FORMATS,
  getAllPrintExecDateString,
  QuestionBankTypeEnum,
} from '../../interfaces';
import {
  StorageService,
  LearningContentService,
  LearningRatingService,
  UtilService,
  AudioService,
  AIService,
  UserCodeService,
  UIService,
} from '../../services';
import { FooterComponent } from '../../shared/footer/footer';
import { MarkdownContentComponent } from '../../shared/markdown-content';
import { fisherYatesShuffle } from '../../shared/utils/shuffle';
import { AppPageTitle } from '../page-title/page-title';

@Component({
  selector: 'app-translate-exercises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FooterComponent,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSortModule,
    MatButtonToggleModule,
    TranslocoModule,
  ],
  templateUrl: './translate-exercises.component.html',
  styleUrl: './translate-exercises.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class TranslateExercisesComponent implements OnInit {
  allFiles: LearningContent[] = [];
  selectedFile?: LearningContent;
  isLoadingContents = true;
  currentStatus: TranslateExerciseUIStatus = {
    status: TranslateExerciseStatusEnum.NotStarted,
    //direction: TranslateDirectionEnum.EnglishToChinese,
    correctCount: 0,
    incorrectCount: 0,
    totalCount: 0,
    startTime: new Date(),
    endTime: new Date(),
  };
  recitequeues: TranslateQueue[] = [];
  queueidx: number = -1; // Current Queue
  allDirections = [
    { value: TranslateDirectionEnum.ChineseToEnglish },
    { value: TranslateDirectionEnum.EnglishToChinese },
  ];
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);

  // dataSourcePreview: LearnEnglishSentFileItem[] = [];
  displayedPreviewColumns = [
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
  private contentRatingMap = new Map<number, number>();
  studyContentId = 0;
  // Result part
  dataSourceResult: any[] = [];
  displayedResultColumns = ['ensent', 'cnsent', 'enwords', 'inputted'];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator, { static: false })
  set content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.paginator = content;
      this.dataSource.paginator = this.paginator;
    }
  }
  dataSource: MatTableDataSource<LearnEnglishSentFileItem> = new MatTableDataSource();
  @ViewChild(MatSort) sort?: MatSort;
  readonly dialog = inject(MatDialog);
  readonly audio = inject(AudioService);
  readonly aiutil = inject(AIService);
  readonly usercode = inject(UserCodeService);
  readonly snackBar = inject(MatSnackBar);
  readonly util = inject(UtilService);
  readonly uiService = inject(UIService);
  readonly router = inject(Router);
  setting: TranslateExerciseOption = {
    countOfItems: 20,
    direction: TranslateDirectionEnum.EnglishToChinese,
    allowEmptyAnswer: false,
  };
  printSetting: TranslateExercisePrintOption = {
    printAnswer: false,
    printWord: false,
    printEntryDate: false,
    direction: TranslateDirectionEnum.EnglishToChinese,
    countOfItems: 20,
  };
  selection = new SelectionModel<LearnEnglishSentFileItem>(true, []);

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

  get isTranslateNotStarted(): boolean {
    return this.currentStatus.status === TranslateExerciseStatusEnum.NotStarted;
  }
  get isTranslateInProgress(): boolean {
    return this.currentStatus.status === TranslateExerciseStatusEnum.InProgress;
  }
  get isTranslateCompleted(): boolean {
    return this.currentStatus.status === TranslateExerciseStatusEnum.Completed;
  }
  get reciteQueuesCount(): number {
    return this.dataSource.data.length;
  }
  get currentQueueItem(): TranslateQueue | undefined {
    return this.recitequeues[this.queueidx] ?? undefined;
  }
  get currentProgress(): number {
    return this.reciteQueuesCount === 0 ? 100 : (this.queueidx * 100) / this.reciteQueuesCount;
  }
  private storage = inject(StorageService);
  private readonly contentService = inject(LearningContentService);
  private readonly ratingService = inject(LearningRatingService);
  readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  get isEnglishToChineseDirection(): boolean {
    return this.setting.direction === TranslateDirectionEnum.EnglishToChinese;
  }
  get isChineseToEnglishDirection(): boolean {
    return this.setting.direction === TranslateDirectionEnum.ChineseToEnglish;
  }

  getDirectionName(dir: TranslateDirectionEnum): string {
    switch (dir) {
      case TranslateDirectionEnum.ChineseToEnglish:
        return this.transloco.translate('translateExercises.chineseToEnglish');
      default:
        return this.transloco.translate('translateExercises.englishToChinese');
    }
  }

  constructor() {
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
      return '';
    };
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Sentences';

    this.contentService
      .getSentenceContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: contents => {
        this.allFiles = contents;
        this.isLoadingContents = false;
      },
      error: err => {
        console.error(err);
        this.isLoadingContents = false;
      },
    });
  }

  private coverContentToQueue(content: LearnEnglishSentFileItem[]): TranslateQueue[] {
    const queues: TranslateQueue[] = [];
    content.forEach(item => {
      queues.push({
        ensent: item.ensent,
        cnsent: item.cnsent,
        enwords: item.enwords,
        completed: false,
        inputted: '',
      });
    });
    return queues;
  }

  private formatEnwords(enwords?: string[]): string {
    if (!enwords || enwords.length === 0) {return '';}
    return enwords.join(', ');
  }
  onFileSelectionChanged(event: MatSelectChange) {
    if (!event.value) {
      this.dataSource.data = [];
      this.studyContentId = 0;
      this.contentRatingMap.clear();
      return;
    }

    const selectedContent = event.value as LearningContent;
    this.studyContentId = selectedContent.id;

    this.contentService
      .getSentenceFileContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (df?: LearnEnglishSentFileItem[]) => {
        this.recitequeues = [];
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
          },
          error: err => console.error('Failed to load ratings', err),
        });
    }
  }

  getRating(itemId: string | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    const numId = parseInt(itemId, 10);
    return isNaN(numId) ? 0 : (this.contentRatingMap.get(numId) ?? 0);
  }

  onContentRatingChanged(item: LearnEnglishSentFileItem, event: MatButtonToggleChange) {
    if (this.studyContentId <= 0 || item.id === undefined || event.value < 1) {
      return;
    }
    const numId = parseInt(item.id, 10);
    if (isNaN(numId)) {
      return;
    }

    this.ratingService
      .upsertRating(this.studyContentId, numId, event.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.contentRatingMap.set(numId, saved.rating);
        },
        error: err => console.error('Failed to save rating', err),
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPlayTTS(sent: string) {
    this.aiutil
      .getTTS(sent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (data: any) => {
        this.audio.playSound(data.audioFileUrl as string, false);
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
        title: 'Explanation',
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
        title: 'Extra Info',
        content: extraInfo ? extraInfo.join('\n\n') : '',
      },
      width: '800px',
      height: '600px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }

  onStart() {
    const numSelected = this.selection.selected.length > 0 ? this.selection.selected.length : 0;
    if (numSelected > 0) {
      this.recitequeues = this.coverContentToQueue(this.selection.selected);
    } else {
      this.recitequeues = this.coverContentToQueue(this.dataSource.data);
      if (this.recitequeues.length > this.setting.countOfItems) {
        // Randomize the array `this.wordqueues`
        this.recitequeues = fisherYatesShuffle(this.recitequeues);
        // Keep only the first `this.countOfItems` items
        this.recitequeues = this.recitequeues.slice(0, this.setting.countOfItems);
      }
    }

    this.queueidx = 0;
    this.currentStatus.status = TranslateExerciseStatusEnum.InProgress;
    this.currentStatus.startTime = new Date();
    this.currentStatus.totalCount = this.recitequeues.length;

    this.dataSourceResult = [];
  }

  onStartWithOptions() {
    const dialogRef = this.dialog.open(TranslateExercisesOptionsDialogComponent, {
      data: {
        reciteQueuesCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.dataSource.data.length,
        withSelection: this.selection.selected.length > 0 ? true : false,
        allDirections: this.allDirections,
        getDirectionName: this.getDirectionName,
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
        this.setting.direction = result.direction;
        this.setting.allowEmptyAnswer = result.allowEmptyAnswer;
        this.setting.countOfItems = result.countOfItems;

        this.onStart();
      }
    });
  }

  onPrint() {
    // Check whether there are selections
    const numSelected = this.selection.selected.length > 0 ? this.selection.selected.length : 0;
    let prints = [];
    if (numSelected > 0) {
      prints = this.coverContentToQueue(this.selection.selected);
    } else {
      this.recitequeues = this.coverContentToQueue(this.dataSource.data);
      prints = this.recitequeues.slice();

      if (prints.length > this.printSetting.countOfItems) {
        // Randomize the array `this.wordqueues`
        prints = fisherYatesShuffle(prints);
        // Keep only the first `this.countOfItems` items
        prints = prints.slice(0, this.printSetting.countOfItems);
      }
    }

    const items: KnowledgeExerciseFileContent[] = [];
    prints.forEach((queueitem, idx) => {
      const nidx = idx + 1;
      const wordText = Array.isArray(queueitem.enwords)
        ? queueitem.enwords.join(', ')
        : queueitem.enwords || '';
      items.push({
        id: nidx.toString(),
        order: nidx,
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question:
          this.printSetting.direction === TranslateDirectionEnum.EnglishToChinese
            ? `${this.printSetting.printWord ? '(' + wordText + ')' : ''}${queueitem.ensent} @${queueitem.cnsent}@`
            : `${this.printSetting.printWord ? '(' + wordText + ')' : ''}${queueitem.cnsent} @${queueitem.ensent}@`,
      });
    });
    const execPrintSetting: KnowledgeExercisePrintOption = {
      formTitle: this.selectedFile?.nameEnglish ? this.selectedFile.nameEnglish : 'Translate Exercises',
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

  onPrintWithOptions() {
    const dialogRef = this.dialog.open(TranslateExercisesPrintOptionsDialogComponent, {
      data: {
        reciteQueuesCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.reciteQueuesCount,
        withSelection: this.selection.selected.length > 0 ? true : false,
        allDirections: this.allDirections,
        getDirectionName: this.getDirectionName,
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

  onSubmitToNext() {
    this.dataSourceResult.push({
      ensent: this.recitequeues[this.queueidx].ensent,
      cnsent: this.recitequeues[this.queueidx].cnsent,
      enwords: this.recitequeues[this.queueidx].enwords,
      inputted: this.recitequeues[this.queueidx].inputted,
    });

    this.setQueueIndex(this.queueidx + 1);
  }

  setQueueIndex(idx = 0) {
    if (idx >= 0 && idx < this.recitequeues.length) {
      if (this.queueidx !== -1) {
        this.recitequeues[this.queueidx].completed = true;
      }

      this.queueidx = idx;
    } else if (idx === this.recitequeues.length) {
      if (this.queueidx !== -1) {
        this.recitequeues[this.queueidx].completed = true;
      }

      // When reaching the end, mark exercise as completed
      this.currentStatus.status = TranslateExerciseStatusEnum.Completed;
      this.currentStatus.endTime = new Date();
    }
  }
}

@Component({
  selector: 'app-translate-exercises-options-dlg',
  templateUrl: 'translate-exercises-options-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatSelectModule,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
})
export class TranslateExercisesOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesOptionsDialogComponent>);
  readonly transloco = inject(TranslocoService);
  readonly countOfItems = model(this.data.withSelection ? this.data.reciteQueuesCount : 20);
  readonly allowEmptyAnswer = model(false);
  readonly direction = model(TranslateDirectionEnum.EnglishToChinese);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reciteQueuesCount: number;
      withSelection: boolean;
      allDirections: any[];
      getDirectionName: any;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const closedata: TranslateExerciseOption = {
      allowEmptyAnswer: this.allowEmptyAnswer(),
      countOfItems: this.countOfItems(),
      direction: this.direction(),
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-translate-exercises-printoptions-dlg',
  templateUrl: 'translate-exercises-printoptions-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatSelectModule,
    MatDialogActions,
    MatDatepickerModule,
    MatDateFnsModule,
    MatRadioModule,
    TranslocoModule,
  ],
  providers: [
    provideDateFnsAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: zhCN },
  ],
})
export class TranslateExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesOptionsDialogComponent>);
  readonly countOfItems = model(this.data.withSelection ? this.data.reciteQueuesCount : 20);
  readonly printAnswer = model(false);
  readonly printWord = model(false);
  readonly direction = model(TranslateDirectionEnum.EnglishToChinese);
  readonly printEntryDate = model(true);
  readonly selectedExecDateModel = model<number>(0);
  readonly execDate = model(new Date());

  readonly allPrintExecDates = getAllPrintExecDateString();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reciteQueuesCount: number;
      withSelection: boolean;
      allDirections: any[];
      getDirectionName: any;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const closedata: TranslateExercisePrintOption = {
      printAnswer: this.printAnswer(),
      printWord: this.printWord(),
      countOfItems: this.countOfItems(),
      direction: this.direction(),
      printEntryDate: this.printEntryDate(),
      respectRetentionCurve: this.selectedExecDateModel() === 1 ? true : false,
      printExecDate: this.selectedExecDateModel() === 2 ? true : false,
      execDate: this.selectedExecDateModel() === 2 ? this.execDate() : undefined,
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-translate-exercises-info-dlg',
  templateUrl: 'translate-exercises-info-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MarkdownContentComponent,
    TranslocoModule,
  ],
})
export class TranslateExercisesInfoDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesInfoDialogComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      content: string;
    }
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-translate-exercises-llm-dlg',
  templateUrl: 'translate-exercises-llm-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatSelectModule,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
  standalone: true,
})
export class TranslateExercisesLLMDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesLLMDialogComponent>);
  readonly mode = model(TranslationAIModeEnum.Explain);
  readonly trans = model('');
  readonly aireply = model('');
  readonly transloco = inject(TranslocoService);
  aiutil = inject(AIService);
  private readonly destroyRef = inject(DestroyRef);
  allAIModes = [{ value: TranslationAIModeEnum.Explain }, { value: TranslationAIModeEnum.Correct }];
  getAIModeName(mode: TranslationAIModeEnum): string {
    switch (mode) {
      case TranslationAIModeEnum.Explain:
        return this.transloco.translate('translateExercises.explain');
      default:
        return this.transloco.translate('translateExercises.correct');
    }
  }
  get isTranslationModeCorrection(): boolean {
    return this.mode() === TranslationAIModeEnum.Correct;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { orgsent: string }) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.mode() === TranslationAIModeEnum.Explain) {
      this.aiutil
        .explainSentence(`请从词汇、语法角度讲解一下'${this.data.orgsent}'，返回长度控制在100字。`)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data: any) => {
            this.aireply.set(data.content);
          },
          error: err => {
            console.error(err);
          },
        });
    } else if (this.mode() === TranslationAIModeEnum.Correct) {
      this.aiutil
        .explainSentence(
          `英文原文：'${this.data.orgsent}'，我的翻译为'${this.trans()}', 请从词汇语法角度分析翻译是否正确。返回长度控制在100字。`
        )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data: any) => {
            this.aireply.set(data.content);
          },
          error: err => {
            console.error(err);
          },
        });
    }
  }
}
