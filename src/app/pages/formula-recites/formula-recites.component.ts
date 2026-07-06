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
import type { SafeHtml } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import { MatRadioModule } from '@angular/material/radio';
import type { MatSelectChange } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type {
  FormulaReciteContent,
  FormulaRecitePrintOption,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  LearningContent,
} from '../../interfaces';
import {
  FormulaReciteAIModeEnum,
  getAllPrintExecDateString,
  MY_DATE_FORMATS,
  QuestionBankTypeEnum,
} from '../../interfaces';
import { AIService, LearningContentService, UIService, UserCodeService, UtilService } from '../../services';
import { FooterComponent } from '../../shared/footer/footer';
import { MathItemComponent } from '../../shared/mathitem';
import { fisherYatesShuffle } from '../../shared/utils/shuffle';
import { AppPageTitle } from '../page-title/page-title';

@Component({
  selector: 'app-formula-recite',
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
    MathItemComponent,
    MatPaginatorModule,
    TranslocoModule,
  ],
  templateUrl: './formula-recites.component.html',
  styleUrl: './formula-recites.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class FormulaRecitesComponent implements OnInit {
  allFiles: LearningContent[] = [];
  selectedFile?: LearningContent;
  recitequeues: FormulaReciteContent[] = [];
  queueidx: number = -1; // Current Queue
  // Table of content
  dataSource: MatTableDataSource<FormulaReciteContent> = new MatTableDataSource();
  paginator!: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) set content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.paginator = content;
      this.dataSource.paginator = this.paginator;
    }
  }
  displayedColumns = ['select', 'name', 'ai', 'math', 'value', 'source'];
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Dialog
  readonly dialog = inject(MatDialog);
  printSetting: FormulaRecitePrintOption = {
    countOfItems: 20,
    printEntryDate: true,
    randomOrder: true,
    printSource: false,
    printExecDate: false,
    execDate: new Date(),
  };
  selection = new SelectionModel<FormulaReciteContent>(true, []);
  // Print
  printqueues: FormulaReciteContent[] = [];
  a4Width = 190;
  a4Height = 277;

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

  get reciteContentCount(): number {
    return this.dataSource.data.length;
  }
  get currentDateString(): string {
    return new Date().toISOString();
  }

  getDisplayContentText(contval: string): string {
    if (this.selectedFile?.version === 2) {
      return contval.replaceAll('@', '');
    }

    return contval;
  }
  /** Sanitized version for [innerHTML] binding — strips any HTML to prevent XSS. */
  getDisplayContentTextSafe(contval: string): SafeHtml {
    const raw = this.getDisplayContentText(contval);
    return this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
  }
  /** Sanitized version for [innerHTML] binding in test mode. */
  getDisplayContentTextInTest(contval: string): SafeHtml {
    let raw: string;
    if (this.selectedFile?.version === 2) {
      const substrs = contval.split('@');
      const rststr: string[] = [];
      substrs.forEach((sstr, idx) => {
        if (idx % 2 === 0) {
          rststr.push(sstr);
        } else {
          rststr.push('__'.repeat(sstr.length));
        }
      });
      raw = rststr.join('');
    } else {
      raw = '_'.repeat(contval.length);
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
  }

  private readonly contentService = inject(LearningContentService);
  private readonly util = inject(UtilService);
  private readonly uiService = inject(UIService);
  public readonly usercode = inject(UserCodeService);
  private readonly ai = inject(AIService);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  getEntryDateString(): string {
    return this.util.getEntryDateString(
      this.printSetting.printExecDate && this.printSetting.execDate
        ? this.printSetting.execDate
        : undefined
    );
  }

  constructor() {}

  ngOnInit(): void {
    this.pageTitle.title = 'Formula';

    this.contentService
      .getFormulaContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: df => {
          this.allFiles = df;
          // OnPush: the file list arrives in an async subscribe callback, so the
          // view is not marked dirty automatically — without this the files
          // dropdown stays empty until a later DOM event triggers detection.
          this.cd.markForCheck();
        },
        error: err => {
          console.error(err);
        },
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onFileSelectionChanged(event: MatSelectChange) {
    // Drop selection carried over from the previously loaded file.
    this.selection.clear();

    if (!event.value) {
      this.dataSource.data = [];
      return;
    }
    // Read the file.
    const selectedContent = event.value as LearningContent;
    this.contentService
      .getFormulaFileContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: df => {
        if (df) {
          this.dataSource.data = df.slice();
          this.dataSource.paginator = this.paginator;
        }
      },
      error: err => {
        console.error(err);
      },
    });
  }

  onLLMExplain(item: FormulaReciteContent) {
    // this.ai.explainFormat(this.selectedFile?.contenttype ?? '', itemval + '请生成3条与该知识点有关、高难度、适用于高中生的考题。').subscribe({
    //   next: (res) => {
    //     console.log(res);
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   }
    // });
    const contstr = this.getDisplayContentText(item.value);
    this.dialog.open(FormulaRecitesLLMDialogComponent, {
      data: {
        formattype: '',
        name: item.name,
        content: contstr,
      },
      width: '600px',
      height: '800px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }

  onPrint() {
    this.printqueues = [];
    // Refresh the UI
    this.cd.detectChanges();

    if (this.selection.selected.length > 0) {
      this.printqueues = this.selection.selected;
      if (this.printSetting.randomOrder) {
        this.printqueues = fisherYatesShuffle(this.printqueues);
      }
    } else {
      this.printqueues = this.dataSource.data.slice();

      if (this.printSetting.randomOrder) {
        this.printqueues = fisherYatesShuffle(this.printqueues);
      }

      if (this.printqueues.length > this.printSetting.countOfItems) {
        // Keep only the first `this.countOfItems` items
        this.printqueues = this.printqueues.slice(0, this.printSetting.countOfItems);
      }
    }
    // Refresh the UI
    this.cd.detectChanges();

    // New approach
    const items: KnowledgeExerciseFileContent[] = [];
    this.printqueues.forEach((queueitem, idx) => {
      const nidx = idx + 1;
      items.push({
        id: nidx.toString(),
        order: nidx,
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question:
          this.selectedFile &&
          this.selectedFile.version !== undefined &&
          this.selectedFile.version === 2
            ? queueitem.value
            : queueitem.name + '@' + queueitem.value + '@',
      });
    });
    const execPrintSetting: KnowledgeExercisePrintOption = {
      formTitle: `${this.selectedFile?.nameChinese ?? ''}, ${this.printSetting.subtitle ?? ''}`,
      printEntryDate: true,
      printScore: true,
      printAnswer: true,
      printID: false,
      printHintOfAnswer: true,
      hideLabelOfQuestionType: [QuestionBankTypeEnum.FillInTheBlank],
    };
    this.uiService.setSelectedExerciseItem(items, execPrintSetting, true);
    void this.router.navigate(['/knowledge/displayv2']);
  }

  onPrintWithOptions() {
    const dialogRef = this.dialog.open(FormulaRecitesPrintOptionsDialogComponent, {
      data: {
        filename: this.selectedFile?.nameChinese ?? '',
        reciteContentCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.dataSource.data.length,
        disableCount: this.selection.selected.length > 0 ? true : false,
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
        this.printSetting.countOfItems = result.countOfItems;
        this.printSetting.subtitle = result.subtitle ?? '';
        this.printSetting.printEntryDate = result.printEntryDate;
        this.printSetting.randomOrder = result.randomOrder;
        this.printSetting.printSource = result.printSource;
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
}

@Component({
  selector: 'app-formula-recite-printoptions-dlg',
  templateUrl: 'formula-recites-printoptions-dialog.html',
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
export class FormulaRecitesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<FormulaRecitesPrintOptionsDialogComponent>);
  readonly snackBar = inject(MatSnackBar);
  readonly transloco = inject(TranslocoService);

  readonly countOfItems = model(this.data.disableCount ? this.data.reciteContentCount : 20);
  readonly printEntryDate = model(true);
  readonly printSource = model(false);
  readonly subtitle = model('');
  readonly randomOrder = model(true);
  readonly selectedExecDateModel = model<number>(0);
  readonly execDate = model(new Date());

  readonly allPrintExecDates = getAllPrintExecDateString();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { reciteContentCount: number; disableCount: boolean; filename: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    if (this.selectedExecDateModel() === 1) {
      this.snackBar.open(
        this.transloco.translate('formulaRecites.notYetSupported'),
        this.transloco.translate('close'),
        {
          duration: 2000,
        }
      );
      return;
    }

    const closedata: FormulaRecitePrintOption = {
      subtitle: this.subtitle(),
      printEntryDate: this.printEntryDate(),
      printSource: this.printSource(),
      countOfItems: this.countOfItems(),
      randomOrder: this.randomOrder(),
      respectRetentionCurve: false,
      printExecDate: this.selectedExecDateModel() === 2 ? true : false,
      execDate: this.selectedExecDateModel() === 2 ? this.execDate() : undefined,
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-formula-recites-llm-dlg',
  templateUrl: 'formula-recites-llm-dialog.html',
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
export class FormulaRecitesLLMDialogComponent {
  readonly dialogRef = inject(MatDialogRef<FormulaRecitesLLMDialogComponent>);
  readonly mode = model(FormulaReciteAIModeEnum.Explain);
  readonly name = model('');
  readonly content = model('');
  readonly aireply = model('');
  readonly transloco = inject(TranslocoService);
  aiutil = inject(AIService);
  private readonly destroyRef = inject(DestroyRef);
  allAIModes = [
    { value: FormulaReciteAIModeEnum.Explain },
    { value: FormulaReciteAIModeEnum.MoreQuiz },
  ];
  getAIModeName(mode: FormulaReciteAIModeEnum): string {
    switch (mode) {
      case FormulaReciteAIModeEnum.Explain:
        return this.transloco.translate('formulaRecites.explain');
      default:
        return this.transloco.translate('formulaRecites.generateQuiz');
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { formattype: string; name: string; content: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.mode() === FormulaReciteAIModeEnum.Explain) {
      this.aiutil
        .explainFormat(
          this.data.formattype,
          `请讲解一下如下知识点'${this.data.content}'，返回长度控制在200字。`
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
    } else if (this.mode() === FormulaReciteAIModeEnum.MoreQuiz) {
      this.aiutil
        .explainFormat(
          this.data.formattype,
          `请为知识点：'${this.data.content}'生成三个题目，难度为高考。`
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
