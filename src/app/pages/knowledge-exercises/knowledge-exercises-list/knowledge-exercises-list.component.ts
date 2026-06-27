import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
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
  KnowledgeExerciseFile,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  KnowledgeExerciseSelectOption,
  QuestionBankItemBase,
  QuestionBankTypeKeys,
} from '../../../interfaces';
import {
  getAllQuestionBankTypes,
  MY_DATE_FORMATS,
  SelectionModeEnum,
  getSelectionModeNames,
  convertToQuestionBankItem,
  convertQuestionBankItemToMarkdown,
  QuestionBankTypeEnum,
} from '../../../interfaces';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

interface FilterResult {
  item: KnowledgeExerciseFileContent;
  ranking: number;
}

enum ContentToDisplayEnum {
  List = 1,
  Detail = 2,
  ExtraInfo = 3,
}
import { StorageService, UIService, LearningContentService, LearningRatingService } from '../../../services';
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
  selectedFile?: KnowledgeExerciseFile;
  allFiles?: KnowledgeExerciseFile[];
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
  readonly storage = inject(StorageService);
  readonly learningContentService = inject(LearningContentService);
  readonly uiService = inject(UIService);
  private readonly ratingService = inject(LearningRatingService);
  // Dialog
  readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
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
    // Fetch knowledge bank contents from API and merge with metadata from data.json
    this.learningContentService
      .getKnowledgeBankContents()
      .pipe(
        switchMap(contents =>
          this.storage.getKnowledgeExerciseFile().pipe(
            map(metaFiles => ({ contents, metaFiles })),
            catchError(err => {
              console.error('Failed to load knowledge metadata', err);
              // Fallback: emit empty metadata array so the outer stream still succeeds
              return of({ contents, metaFiles: [] as KnowledgeExerciseFile[] });
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ contents, metaFiles }) => {
          const latexMap = new Map<string, boolean>();
          for (const mf of metaFiles) {
            if (mf.includeLatex) latexMap.set(mf.file, true);
          }
          this.allFiles = contents.map(c => {
            const fileName = c.fileUrl.substring(c.fileUrl.lastIndexOf('/') + 1);
            return {
              id: c.id,
              name: c.nameChinese,
              file: c.fileUrl,
              includeLatex: latexMap.get(fileName),
            };
          });
          this.isLoadingContents = false;
        },
        error: err => {
          console.error(err);
          this.isLoadingContents = false;
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

    const selectedContent = event.value as KnowledgeExerciseFile;
    this.currentContentId = selectedContent.id;

    // Compute the base URL for resolving relative image paths within this JSON file
    this.currentImageBaseUrl = this.learningContentService.getStorageFileBaseUrl(selectedContent.file);

    this.dataSource.data = [];
    this.selection.clear();
    this.contentRatingMap.clear();

    this.learningContentService
      .getKnowledgeExerciseContent(selectedContent.file)
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
        },
        error: err => {
          console.error('Failed to save rating', err);
          this.contentRatingMap.delete(numId);
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
        defaultTitle: this.selectedFile?.name || '',
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

  onSelect() {
    const dialogRef = this.dialog.open(KnowledgeExercisesSelectOptionsDialogComponent, {
      data: {},
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
        if (result.selectedSelectMode === SelectionModeEnum.ByID && result.importIDs) {
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
          }
        } else if (
          result.selectedSelectMode === SelectionModeEnum.FreeSelection &&
          result.countOfItems > 0
        ) {
          // Random select
          this.selection.clear();

          let narr = [];
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
        }
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
  selector: 'app-knowledge-exercises-selectoptions-dlg',
  templateUrl: 'knowledge-exercises-selectoptions-dlg.html',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeExercisesSelectOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeExercisesSelectOptionsDialogComponent>);

  readonly importIDs = model('');
  readonly selectedSelectMode = model(SelectionModeEnum.ByID);
  readonly countOfItems = model(0);
  readonly filterOnTag = model('');
  allSelectModes = getSelectionModeNames();
  get isSelectByID(): boolean {
    return this.selectedSelectMode() === SelectionModeEnum.ByID;
  }
  get isSelectByFreeSelection(): boolean {
    return this.selectedSelectMode() === SelectionModeEnum.FreeSelection;
  }

  constructor() {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    if (this.selectedSelectMode() === SelectionModeEnum.ByID) {
      return this.importIDs().trim() === '';
    } else if (this.selectedSelectMode() === SelectionModeEnum.FreeSelection) {
      return this.countOfItems() <= 0;
    }
    return true;
  }

  onYesClick(): void {
    const closedata: KnowledgeExerciseSelectOption = {
      selectedSelectMode: this.selectedSelectMode(),
      importIDs: this.importIDs(),
      countOfItems: this.countOfItems(),
      filterOnTag: this.filterOnTag(),
    };

    this.dialogRef.close(closedata);
  }
}
