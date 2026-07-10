import { SelectionModel } from '@angular/cdk/collections';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  Inject,
  inject,
  model,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import type { MatSelectChange } from '@angular/material/select';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type {
  LearnEnglishWordFileItem,
  LearningContent,
  StudyQueueItem,
  VocabularyPrintOption,
  VocabularyStudyOption,
  VocabularyTypingOption,
  VocabularyTypingQueue,
  VocabularyTypingQueueResult,
  VocabularyWordLetter,
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  UserLearningRating,
} from '../../interfaces';
import {
  MY_DATE_FORMATS,
  VocabularyExcludedPartEnum,
  getAllPrintExecDateString,
  QuestionBankTypeEnum,
  RatingOperatorEnum,
} from '../../interfaces';
import { AudioService, LearningContentService, LearningRatingService, UIService, UtilService } from '../../services';
import { FooterComponent } from '../../shared/footer/footer';
import { fisherYatesShuffle } from '../../shared/utils/shuffle';
import { AppPageTitle } from '../page-title/page-title';

@Component({
  selector: 'app-vocabulary-exercises',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatMenuModule,
    FooterComponent,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises.component.html',
  styleUrl: './vocabulary-exercises.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class VocabularyExercisesComponent implements OnInit {
  allFiles: LearningContent[] = [];
  selectedFile?: LearningContent;
  isLoadingContents = true;
  // Table for content
  dataSource: MatTableDataSource<LearnEnglishWordFileItem> = new MatTableDataSource();
  selection = new SelectionModel<LearnEnglishWordFileItem>(true, []);
  displayedContentColumns: string[] = ['select', 'id', 'enword', 'cnword', 'rating'];
  private contentRatingMap = new Map<number, number>();
  displayedResultColumns = ['ensent', 'cnsent', 'enword', 'inputted'];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) set content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.paginator = content;
      this.dataSource.paginator = this.paginator;
    }
  }
  @ViewChild(MatSort) sort?: MatSort;
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Service
  private readonly audiosrv = inject(AudioService);
  private readonly contentService = inject(LearningContentService);
  readonly dialog = inject(MatDialog);
  // Navigation
  readonly router = inject(Router);
  readonly uiService = inject(UIService);
  private readonly ratingService = inject(LearningRatingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  // Maps selected file index to backend ContentId
  studyContentId = 0;
  private studyRatingMap = new Map<number, UserLearningRating>();
  // Study options
  studySetting: VocabularyStudyOption = {
    disableVoice: false,
    hideExplain: false,
    countOfItems: 20,
  };
  isStudying = false;
  studyQueues: StudyQueueItem[] = [];
  currentStudyProgress = 0;
  currentStudyCursor = 0;
  // Typing
  typeSetting: VocabularyTypingOption = {
    disableVoice: false,
    hideExplain: false,
    countOfItems: 20,
  };
  dataSourceResult: VocabularyTypingQueueResult[] = [];
  displayedColumns: string[] = ['word', 'correct'];
  isTypingInProgress = false;
  isTypingCompleted = false;
  private wordqueues: VocabularyTypingQueue[] = [];
  private _arwords: VocabularyWordLetter[] = [];
  private _queueidx = -1;
  private _wordidx = -1;
  typingCorrectWordCount = 0;
  typingIncorrectWordCount = 0;
  // Print
  printSetting: VocabularyPrintOption = {
    countOfItems: 20,
    printEntryDate: true,
  };

  get wordQueueCount(): number {
    return this.dataSource.data.length;
  }

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
  get letterarray(): VocabularyWordLetter[] {
    return this._arwords;
  }
  get wordExplain(): string {
    if (this._queueidx >= 0 && this._queueidx < this.wordqueues.length) {
      return this.wordqueues[this._queueidx].cnword;
    }
    return '';
  }
  get currentTypingProgress(): number {
    return this.wordQueueCount === 0 ? 100 : (this._queueidx * 100) / this.wordQueueCount;
  }

  get isStudyPreviousDisabled(): boolean {
    return this.currentStudyCursor <= 0;
  }

  get isStudyNextDisabled(): boolean {
    return this.currentStudyCursor >= this.studyQueues.length - 1;
  }

  constructor() {
    // Constructor
    this.dataSource.sortingDataAccessor = (
      data: LearnEnglishWordFileItem,
      sortHeaderId: string
    ): string | number => {
      if (sortHeaderId === 'rating') {
        return this.getRating(data.id);
      }
      // Validate the sort key against known fields to avoid `as any` escape.
      const validKeys: (keyof LearnEnglishWordFileItem)[] = ['id', 'enword', 'cnword'];
      const key = validKeys.includes(sortHeaderId as keyof LearnEnglishWordFileItem)
        ? (sortHeaderId as keyof LearnEnglishWordFileItem)
        : 'enword';
      const value = data[key];
      return typeof value === 'string' ? value.toLowerCase() : (value ?? 0);
    };
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Vocabulary';

    this.contentService
      .getVocabularyContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: contents => {
        this.allFiles = contents;
        this.isLoadingContents = false;
        // OnPush: the file list arrives in an async subscribe callback (not a
        // template event, not an async pipe), so the view is not marked dirty
        // automatically. Without this, the files dropdown stays empty until a
        // later DOM event happens to trigger change detection.
        this.cdr.markForCheck();
      },
      error: err => {
        console.error(err);
        this.isLoadingContents = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getRating(itemId: number | undefined): number {
    if (itemId === undefined) {
      return 0;
    }
    return this.contentRatingMap.get(itemId) ?? 0;
  }

  onContentRatingChanged(item: LearnEnglishWordFileItem, event: MatButtonToggleChange) {
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

  onFileSelectionChanged(event: MatSelectChange) {
    // Drop any selection carried over from the previously loaded file — the
    // SelectionModel holds references to the old file's row objects, which are
    // no longer relevant and would otherwise keep the study/print buttons
    // acting on stale rows.
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
      .getVocabularyWordContent(selectedContent.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (df?: LearnEnglishWordFileItem[]) => {
        // Empty the wordqueues
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

  onAddFileButtonClick(fileInputRef: HTMLInputElement) {
    fileInputRef.click();
  }

  onAddTempFile(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files && files.length > 0) {
      const selectedFile = files[0];

      const reader = new FileReader();

      reader.onload = e => {
        try {
          const fileContent = e.target!.result as string;
          const parsed: unknown = JSON.parse(fileContent);

          // Validate schema: must be an array of objects with string enword/cnword
          if (!Array.isArray(parsed)) {
            console.error('Invalid file format: expected a JSON array.');
            return;
          }

          const arwords: LearnEnglishWordFileItem[] = [];
          const MAX_ITEMS = 10000;
          const MAX_WORD_LENGTH = 500;

          for (const item of parsed) {
            if (typeof item !== 'object' || item === null) {
              console.error('Invalid file format: array items must be objects.');
              return;
            }
            const obj = item as Record<string, unknown>;
            if (typeof obj['enword'] !== 'string' || typeof obj['cnword'] !== 'string') {
              console.error('Invalid file format: each item must have string "enword" and "cnword" properties.');
              return;
            }
            if (obj['enword'].length > MAX_WORD_LENGTH || obj['cnword'].length > MAX_WORD_LENGTH) {
              console.error(`Invalid word length (max ${MAX_WORD_LENGTH} characters).`);
              return;
            }
            arwords.push({ enword: obj['enword'], cnword: obj['cnword'] });
            if (arwords.length >= MAX_ITEMS) {
              break;
            }
          }

          if (arwords.length === 0) {
            console.error('No valid vocabulary items found in file.');
            return;
          }

          // Generate a unique temp file URL
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const tempFileUrl = `temp-${timestamp}.json`;

          // Create a synthetic LearningContent entry for the temp file
          const tempContent: LearningContent = {
            id: -(Date.now()),
            categoryId: 1,
            nameEnglish: tempFileUrl,
            nameChinese: '临时文件',
            fileUrl: tempFileUrl,
          };

          // Register content in the learning content service cache
          this.contentService.addTemporaryContent(tempFileUrl, arwords);

          // Add to file list and select it
          this.allFiles.push(tempContent);
          this.selectedFile = tempContent;

          // Update data source
          this.dataSource.data = arwords.slice();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort!;
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };

      reader.readAsText(selectedFile);
    }
  }

  onDownloadTemplateButtonClick() {
    const templateData: LearnEnglishWordFileItem[] = [{ enword: 'example', cnword: '示例' }];

    const dataStr = JSON.stringify(templateData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onStudyWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesStudyOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.dataSource.data.length,
        withSelection: this.selection.selected.length > 0 ? true : false,
      },
      width: '500px',
      height: '480px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        this.studySetting.disableVoice = result.disableVoice;
        this.studySetting.hideExplain = result.hideExplain;
        if (result.excludePart) {
          this.studySetting.excludePart = result.excludePart;
        } else {
          this.studySetting.excludePart = undefined;
        }
        this.studySetting.countOfItems = result.countOfItems;

        this.onStudyCore();
        this.cdr.markForCheck();
      }
    });
  }

  private coverContentToQueue(content: LearnEnglishWordFileItem[]): VocabularyTypingQueue[] {
    const queues: VocabularyTypingQueue[] = [];
    content.forEach(val => {
      queues.push({
        enword: val.enword,
        cnword: val.cnword,
        completed: false,
      });
    });

    return queues;
  }

  onStudyCore() {
    let sourceItems: LearnEnglishWordFileItem[] = [];
    if (this.selection.selected.length > 0) {
      sourceItems = this.selection.selected.slice();
      // Randomize the array
      sourceItems = fisherYatesShuffle(sourceItems);
    } else {
      sourceItems = this.dataSource.data.slice();
      if (this.studySetting.excludePart) {
        const excludedPart = this.studySetting.excludePart;
        sourceItems = sourceItems.filter(
          val =>
            (excludedPart === VocabularyExcludedPartEnum.word && val.enword.indexOf(' ') !== -1) ||
            (excludedPart === VocabularyExcludedPartEnum.phase && val.enword.indexOf(' ') === -1)
        );
      }
      if (
        this.studySetting.wordLeadingCharacter &&
        this.studySetting.wordLeadingCharacter.length > 0
      ) {
        sourceItems = sourceItems.filter(val => {
          return this.studySetting.wordLeadingCharacter?.some(
            char => val.enword.startsWith(char) || val.enword.startsWith(char.toUpperCase())
          );
        });
      }
      if (sourceItems.length > this.studySetting.countOfItems) {
        // Randomize the array
        sourceItems = fisherYatesShuffle(sourceItems);
        // Keep only the first `this.countOfItems` items
        sourceItems = sourceItems.slice(0, this.studySetting.countOfItems);
      }
    }

    this.studyQueues = sourceItems.map(val => ({
      enword: val.enword,
      cnword: val.cnword,
      audiofile: '',
      rating: 0,
      itemId: val.id,
    }));

    // Nothing to study (e.g. a filter excluded every word) — bail out before
    // touching index 0, which would otherwise throw on studyQueues[0].enword
    // and produce an Infinity progress value.
    if (this.studyQueues.length === 0) {
      this.isStudying = false;
      this.currentStudyCursor = 0;
      this.currentStudyProgress = 0;
      return;
    }

    this.currentStudyCursor = 0;
    this.currentStudyProgress = Math.round((1 / this.studyQueues.length) * 100);
    this.isStudying = true;

    // Speak the first word
    if (!this.studySetting.disableVoice) {
      this.speakWord(this.studyQueues[0].enword);
    }

    // Load existing ratings for this content
    this.studyRatingMap.clear();
    if (this.studyContentId > 0) {
    this.ratingService
      .getRatings(this.studyContentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ratings) => {
          for (const r of ratings) {
            if (r.itemId !== undefined) {
              this.studyRatingMap.set(r.itemId, r);
            }
          }
          // Pre-populate ratings in study queue
          for (const sq of this.studyQueues) {
            if (sq.itemId !== undefined && this.studyRatingMap.has(sq.itemId)) {
              sq.rating = this.studyRatingMap.get(sq.itemId)!.rating;
            }
          }
        },
        error: err => console.error('Failed to load ratings', err),
      });
    }
  }

  onStudyPreviousWord() {
    if (this.currentStudyCursor > 0) {
      this.currentStudyCursor--;
      this.currentStudyProgress = Math.round(
        ((this.currentStudyCursor + 1) / this.studyQueues.length) * 100
      );
      this.cdr.markForCheck();
      if (!this.studySetting.disableVoice) {
        this.speakWord(this.studyQueues[this.currentStudyCursor].enword);
      }
    }
  }

  onStudyNextWord() {
    if (this.currentStudyCursor < this.studyQueues.length - 1) {
      this.currentStudyCursor++;
      this.currentStudyProgress = Math.round(
        ((this.currentStudyCursor + 1) / this.studyQueues.length) * 100
      );
      this.cdr.markForCheck();
      if (!this.studySetting.disableVoice) {
        this.speakWord(this.studyQueues[this.currentStudyCursor].enword);
      }
    } else {
      // Save it to the storage db
    }
  }

  onQuitStudy() {
    // Sync ratings captured during study back into the list view's source of
    // truth (contentRatingMap) so the rating column reflects any changes once
    // the list is shown again. studyQueues holds the latest user-selected
    // rating, which covers in-flight upsert requests too.
    for (const sq of this.studyQueues) {
      if (sq.itemId !== undefined && sq.rating >= 1) {
        this.contentRatingMap.set(sq.itemId, sq.rating);
      }
    }

    this.isStudying = false;
    this.studyQueues = [];
    this.currentStudyCursor = 0;
    this.currentStudyProgress = 0;
    this.studyRatingMap.clear();
    this.cdr.markForCheck();
  }

  onRatingChanged(item: StudyQueueItem) {
    if (this.studyContentId <= 0 || item.itemId === undefined || item.rating < 1) {
      return;
    }

    this.ratingService
      .upsertRating(this.studyContentId, item.itemId, item.rating)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (saved) => {
        this.studyRatingMap.set(item.itemId!, saved);
      },
      error: err => console.error('Failed to save rating', err),
    });
  }

  // Typing
  onNeedHint() {
    this.dataSourceResult[this._queueidx].correct = false;
    this._arwords[this._wordidx].visible = true;
    this._wordidx++;
    if (this._wordidx === this._arwords.length) {
      this.setWordQueueIndex(this._queueidx + 1);
    }
  }

  onNextWord() {
    // Give up current word
    this.dataSourceResult[this._queueidx].correct = false;
    this.setWordQueueIndex(this._queueidx + 1);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // ── Study mode keyboard shortcuts ──────────────────────────────
    // 1-5: rate current word, ArrowLeft/Right: prev/next, Esc: quit
    if (this.isStudying) {
      if (event.key === 'Escape') {
        this.onQuitStudy();
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowLeft') {
        this.onStudyPreviousWord();
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowRight') {
        this.onStudyNextWord();
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowUp') {
        const currentItem = this.studyQueues[this.currentStudyCursor];
        if (currentItem.rating < 5) {
          currentItem.rating++;
          this.onRatingChanged(currentItem);
        }
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowDown') {
        const currentItem = this.studyQueues[this.currentStudyCursor];
        if (currentItem.rating > 1) {
          currentItem.rating--;
          this.onRatingChanged(currentItem);
        }
        event.preventDefault();
        return;
      }
      const ratingKey = parseInt(event.key, 10);
      if (ratingKey >= 1 && ratingKey <= 5) {
        const currentItem = this.studyQueues[this.currentStudyCursor];
        currentItem.rating = ratingKey;
        this.onRatingChanged(currentItem);
        event.preventDefault();
        return;
      }
    }

    // ── Typing mode keyboard handling ──────────────────────────────
    if (this._wordidx >= 0 && this._wordidx < this._arwords.length) {
      if (event.key === 'Backspace') {
        this._wordidx--;
        if (this._wordidx >= 0) {
          this._arwords[this._wordidx].visible = false;
        } else {
          this._wordidx = 0;
        }
      } else {
        if (event.key === this._arwords[this._wordidx].letter) {
          this._arwords[this._wordidx].visible = true;
          this.audiosrv.playSound('Default.wav');

          this._wordidx++;
          if (this._wordidx === this._arwords.length) {
            this.setWordQueueIndex(this._queueidx + 1);
          }
        } else {
          // Sending the error indicator.
          this.dataSourceResult[this._queueidx].correct = false;
          this.audiosrv.playSound('beep.wav');
        }
      }
    }
  }

  // Cached speech-synthesis voices. The platform populates getVoices()
  // asynchronously (after the first speak() call, via the `voiceschanged`
  // event), so the very first utterance would otherwise fall back to the
  // default voice despite the explicit US-English selection below. We seed the
  // cache on demand and refresh it when the platform announces voices are
  // ready.
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voicesListenerAttached = false;

  private ensureVoiceCache(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    if (!this.voicesListenerAttached) {
      this.voicesListenerAttached = true;
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis?.getVoices() ?? [];
      };
    }
  }

  private speakWord(word: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    // Explicit US English voice selection (uses the async-populated cache so
    // it applies even on the first utterance of a session).
    this.ensureVoiceCache();
    const usVoice = this.cachedVoices.find(v => v.lang === 'en-US');
    if (usVoice) {
      utterance.voice = usVoice;
    }

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('speechSynthesis error:', e.error);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  setWordQueueIndex(idx = 0) {
    if (idx >= 0 && idx < this.wordqueues.length) {
      if (this._queueidx !== -1) {
        this.wordqueues[this._queueidx].completed = true;
      }

      this._queueidx = idx;
      this._arwords = [];

      const archars = this.wordqueues[idx].enword.split('');
      if (!this.typeSetting.disableVoice) {
        // Use the browser's Web Speech API instead of leaking vocabulary to a third-party server
        this.speakWord(this.wordqueues[idx].enword);
      }

      archars.forEach((val, index: number) => {
        this._arwords.push({
          idx: index,
          visible: false,
          letter: val,
        });
      });
      this._wordidx = 0;
    } else if (idx === this.wordqueues.length) {
      if (this._queueidx !== -1) {
        this.wordqueues[this._queueidx].completed = true;
      }

      const iscompled =
        this.wordqueues.findIndex(que => que.completed === false) === -1 ? true : false;
      if (iscompled) {
        this.isTypingInProgress = false;
        this.isTypingCompleted = true;

        this.typingCorrectWordCount = this.dataSourceResult.filter(
          val => val.correct === true
        ).length;
        this.typingIncorrectWordCount = this.dataSourceResult.filter(
          val => val.correct === false
        ).length;
      }

      this.audiosrv.playSound('correct.wav');
    }
  }

  onTypingWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesTypingOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.dataSource.data.length,
        withSelection: this.selection.selected.length > 0 ? true : false,
      },
      width: '500px',
      height: '480px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        this.typeSetting.disableVoice = result.disableVoice;
        this.typeSetting.hideExplain = result.hideExplain;
        if (result.excludePart) {
          this.typeSetting.excludePart = result.excludePart;
        } else {
          this.typeSetting.excludePart = undefined;
        }
        this.typeSetting.countOfItems = result.countOfItems;

        this.onTypingStart();
        // OnPush: the typing view switch (isTypingInProgress) happens in this
        // async afterClosed callback — without markForCheck the view would not
        // switch to the typing screen until a later DOM event.
        this.cdr.markForCheck();
      }
    });
  }

  onTypingStart() {
    if (this.selection.selected.length > 0) {
      this.wordqueues = this.coverContentToQueue(this.selection.selected);
    } else {
      this.wordqueues = this.coverContentToQueue(this.dataSource.data);
      if (this.typeSetting.excludePart) {
        const excludedPart = this.typeSetting.excludePart;
        this.wordqueues = this.wordqueues.filter(
          val =>
            (excludedPart === VocabularyExcludedPartEnum.word && val.enword.indexOf(' ') !== -1) ||
            (excludedPart === VocabularyExcludedPartEnum.phase && val.enword.indexOf(' ') === -1)
        );
      }
      if (
        this.typeSetting.wordLeadingCharacter &&
        this.typeSetting.wordLeadingCharacter.length > 0
      ) {
        this.wordqueues = this.wordqueues.filter(val => {
          return this.typeSetting.wordLeadingCharacter?.some(
            char => val.enword.startsWith(char) || val.enword.startsWith(char.toUpperCase())
          );
        });
      }
      if (this.wordqueues.length > this.typeSetting.countOfItems) {
        // Randomize the array `this.wordqueues`
        this.wordqueues = fisherYatesShuffle(this.wordqueues);
        // Keep only the first `this.countOfItems` items
        this.wordqueues = this.wordqueues.slice(0, this.typeSetting.countOfItems);
      }
    }

    this.dataSourceResult = [];
    this.wordqueues.forEach(val => {
      this.dataSourceResult.push({
        enword: val.enword,
        correct: true,
      });
    });

    this.isTypingInProgress = true;

    this._queueidx = -1;
    this.setWordQueueIndex();
  }

  // Print
  onPrintWithOptions() {
    const dialogRef = this.dialog.open(VocabularyExercisesPrintOptionsDialogComponent, {
      data: {
        wordQueueCount:
          this.selection.selected.length > 0
            ? this.selection.selected.length
            : this.dataSource.data.length,
        withSelection: this.selection.selected.length > 0 ? true : false,
        title: this.selectedFile?.nameEnglish,
      },
      width: '600px',
      height: '530px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined) {
        if (result.excludePart) {
          this.printSetting.excludePart = result.excludePart;
        } else {
          this.printSetting.excludePart = undefined;
        }
        if (result.subTitle) {
          this.printSetting.subTitle = result.subTitle;
        } else {
          this.printSetting.subTitle = undefined;
        }
        this.printSetting.wordLeadingCharacter = result.wordLeadingCharacter;
        this.printSetting.countOfItems = result.countOfItems;
        this.printSetting.printEntryDate = result.printEntryDate;
        if (result.wordLeadingCharacter) {
          this.printSetting.wordLeadingCharacter = result.wordLeadingCharacter;
        } else {
          this.printSetting.wordLeadingCharacter = undefined;
        }
        this.printSetting.printFirstLetter = result.printFirstLetter;

        this.onNewPrintCore();
      }
    });
  }

  onNewPrintCore() {
    let printqueues: VocabularyTypingQueue[] = [];
    if (this.selection.selected.length > 0) {
      printqueues = this.coverContentToQueue(this.selection.selected);
      // Randomize the array
      printqueues = fisherYatesShuffle(printqueues);
    } else {
      this.wordqueues = this.coverContentToQueue(this.dataSource.data);
      printqueues = this.wordqueues.slice();
      if (this.printSetting.excludePart) {
        const excludedPart = this.printSetting.excludePart;
        printqueues = printqueues.filter(
          val =>
            (excludedPart === VocabularyExcludedPartEnum.word && val.enword.indexOf(' ') !== -1) ||
            (excludedPart === VocabularyExcludedPartEnum.phase && val.enword.indexOf(' ') === -1)
        );
      }
      if (
        this.printSetting.wordLeadingCharacter &&
        this.printSetting.wordLeadingCharacter.length > 0
      ) {
        printqueues = printqueues.filter(val => {
          return this.printSetting.wordLeadingCharacter?.some(
            char => val.enword.startsWith(char) || val.enword.startsWith(char.toUpperCase())
          );
        });
      }
      if (printqueues.length > this.printSetting.countOfItems) {
        // Randomize the array
        printqueues = fisherYatesShuffle(printqueues);
        // Keep only the first `this.countOfItems` items
        printqueues = printqueues.slice(0, this.printSetting.countOfItems);
      }
    }

    const items: KnowledgeExerciseFileContent[] = [];
    printqueues.forEach((queueitem, idx) => {
      const nidx = idx + 1;
      items.push({
        id: nidx.toString(),
        order: nidx,
        itemType: QuestionBankTypeEnum.FillInTheBlank,
        question: `${queueitem.cnword.substring(0, 50)} ${this.printSetting.printFirstLetter ? queueitem.enword[0] : ''} @${queueitem.enword}@`,
      });
    });
    const execPrintSetting: KnowledgeExercisePrintOption = {
      formTitle: this.printSetting.subTitle!,
      printEntryDate: true,
      printScore: true,
      printAnswer: true,
      printHintOfAnswer: false,
      printID: false,
      hideLabelOfQuestionType: [QuestionBankTypeEnum.FillInTheBlank],
      uniformBlankLength: true,
    };
    this.uiService.setSelectedExerciseItem(items, execPrintSetting);
    void this.router.navigate(['/knowledge/displayv2']);
  }

  /** Returns the data array in the current sort order (mirrors MatSort behavior). */
  private getSortedData(): LearnEnglishWordFileItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return this.dataSource.data.slice();
    }

    const sorted = this.dataSource.data.slice();
    sorted.sort((a, b) => {
      const valueA = this.dataSource.sortingDataAccessor(a, this.sort!.active);
      const valueB = this.dataSource.sortingDataAccessor(b, this.sort!.active);

      let result = 0;
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        result = valueA.localeCompare(valueB);
      } else {
        result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }

      return this.sort!.direction === 'asc' ? result : -result;
    });

    return sorted;
  }

  onSelectByCount() {
    const dialogRef = this.dialog.open(VocabularySelectByCountDialogComponent, {
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
        const sortedData = this.getSortedData();
        const offset = result.countOfOffset ?? 0;
        sortedData.forEach((item: LearnEnglishWordFileItem, index: number) => {
          if (index >= offset && index < offset + result.countOfItems) {
            this.selection.select(item);
          }
        });
        this.cdr.markForCheck();
      }
    });
  }

  onSelectByWord() {
    const dialogRef = this.dialog.open(VocabularySelectByWordDialogComponent, {
      data: {},
      width: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result !== undefined && result.words) {
        const arwords = result.words.split(',');
        if (arwords.length > 0) {
          this.selection.clear();
          this.dataSource.data.forEach(item => {
            const selidx = arwords.findIndex((element: string) => element.trim() === item.enword);
            if (selidx !== -1) {
              this.selection.select(item);
            }
          });
        }
        this.cdr.markForCheck();
      }
    });
  }

  onSelectFreeSelection() {
    const dialogRef = this.dialog.open(VocabularySelectFreeDialogComponent, {
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
        const shuffled = fisherYatesShuffle(this.dataSource.data);
        shuffled.forEach((item, index) => {
          if (index < result.countOfItems) {
            this.selection.select(item);
          }
        });
        this.cdr.markForCheck();
      }
    });
  }

  onSelectByRating() {
    const dialogRef = this.dialog.open(VocabularySelectByRatingDialogComponent, {
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
              // "Less than" intentionally excludes unrated (0) words: a rating
              // of 0 means "not yet assessed", which is covered by HasNone.
              // This keeps LessThan 1 from collapsing into HasNone.
              matches = rating > 0 && rating < value;
              break;
            case RatingOperatorEnum.LessOrEquals:
              // Same unrated-exclusion rationale as LessThan: an unrated (0)
              // word is "not yet assessed", not "rated at or below the value".
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
  selector: 'app-vocabulary-exercises-studyoptions-dlg',
  templateUrl: 'vocabulary-exercises-studyoptions-dialog.html',
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
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VocabularyExercisesStudyOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesStudyOptionsDialogComponent>);
  readonly disableVoice = model(false);
  readonly hideExplain = model(false);
  readonly excludePart = model(undefined);
  readonly wordLeadingCharacter = model([] as string[]);
  readonly countOfItems = model(this.data.withSelection ? this.data.wordQueueCount : 20);

  readonly util = inject(UtilService);
  readonly allCharacters = this.util.getAllCharacters();
  readonly allExcludeParts = this.util.getAllTypingExcludeParts();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { wordQueueCount: number; withSelection: boolean }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const closedata: VocabularyStudyOption = {
      disableVoice: this.disableVoice(),
      hideExplain: this.hideExplain(),
      excludePart: this.excludePart(),
      wordLeadingCharacter: this.wordLeadingCharacter(),
      countOfItems: this.countOfItems(),
    };
    if (closedata.disableVoice && closedata.hideExplain) {
      // Enable there are something output
      return;
    }

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-vocabulary-exercises-typingoptions-dlg',
  templateUrl: 'vocabulary-exercises-typingoptions-dialog.html',
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
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VocabularyExercisesTypingOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesTypingOptionsDialogComponent>);

  readonly disableVoice = model(false);
  readonly hideExplain = model(false);
  readonly excludePart = model(undefined);
  readonly wordLeadingCharacter = model([] as string[]);
  readonly countOfItems = model(this.data.withSelection ? this.data.wordQueueCount : 20);

  readonly util = inject(UtilService);
  readonly allCharacters = this.util.getAllCharacters();
  readonly allExcludeParts = this.util.getAllTypingExcludeParts();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { wordQueueCount: number; withSelection: boolean }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const closedata: VocabularyTypingOption = {
      disableVoice: this.disableVoice(),
      hideExplain: this.hideExplain(),
      excludePart: this.excludePart(),
      wordLeadingCharacter: this.wordLeadingCharacter(),
      countOfItems: this.countOfItems(),
    };
    if (closedata.disableVoice && closedata.hideExplain) {
      // Enable there are something output
      return;
    }

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-vocabulary-exercises-printoptions-dlg',
  templateUrl: 'vocabulary-exercises-printoptions-dialog.html',
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
export class VocabularyExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesPrintOptionsDialogComponent>);
  readonly util = inject(UtilService);

  readonly excludePart = model(undefined);
  readonly countOfItems = model(this.data.withSelection ? this.data.wordQueueCount : 20);
  readonly printEntryDate = model(true);
  readonly wordLeadingCharacter = model([] as string[]);
  readonly subTitle = model(this.data.title ?? '');
  readonly printFirstLetter = model(false); // Default shall be false

  readonly allCharacters = this.util.getAllCharacters();
  readonly allExcludeParts = this.util.getAllTypingExcludeParts();
  readonly allPrintExecDates = getAllPrintExecDateString();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { wordQueueCount: number; withSelection: boolean; title?: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const closedata: VocabularyPrintOption = {
      subTitle: this.subTitle(),
      excludePart: this.excludePart(),
      countOfItems: this.countOfItems(),
      printEntryDate: this.printEntryDate(),
      wordLeadingCharacter: this.wordLeadingCharacter(),
      printFirstLetter: this.printFirstLetter(),
    };

    this.dialogRef.close(closedata);
  }
}

@Component({
  selector: 'app-vocabulary-selectbycount-dlg',
  templateUrl: 'vocabulary-exercises-selectbycount-dialog.html',
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
export class VocabularySelectByCountDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularySelectByCountDialogComponent>);
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
  selector: 'app-vocabulary-selectbyword-dlg',
  templateUrl: 'vocabulary-exercises-selectbyword-dialog.html',
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
export class VocabularySelectByWordDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularySelectByWordDialogComponent>);
  readonly importWords = model('');

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    return this.importWords().trim().length <= 0;
  }

  onYesClick(): void {
    this.dialogRef.close({
      words: this.importWords(),
    });
  }
}

@Component({
  selector: 'app-vocabulary-selectfree-dlg',
  templateUrl: 'vocabulary-exercises-selectfree-dialog.html',
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
export class VocabularySelectFreeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularySelectFreeDialogComponent>);
  readonly countOfItems = model(20);

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    return this.countOfItems() <= 0;
  }

  onYesClick(): void {
    this.dialogRef.close({
      countOfItems: this.countOfItems(),
    });
  }
}

@Component({
  selector: 'app-vocabulary-selectbyrating-dlg',
  templateUrl: 'vocabulary-exercises-selectbyrating-dialog.html',
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
export class VocabularySelectByRatingDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularySelectByRatingDialogComponent>);
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
