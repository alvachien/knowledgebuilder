import { AsyncPipe } from '@angular/common';
import type { OnInit, WritableSignal } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  inject,
  signal,
  ViewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { MatInput, MatInputModule } from '@angular/material/input';
import type { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import type { MatSelectChange } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { NgxPrintModule } from 'ngx-print';

import {
  EnglishListeningStatusEnum,
  convertToQuestionBankItem,
  convertQuestionBankItemToMarkdown,
  convertQuestionBankItemAnswerToMarkdown,
} from '../../interfaces';
import type {
  EnglishListeningUIStatus,
  EnglishListeningLesson,
  EnglishListeningSection,
  EnglishListeningUIInputContent,
  EnglishListeningUICheckResult,
  EnglishListeningExercise,
  QuestionBankItemBase,
  QuestionBankTypeKeys,
} from '../../interfaces';
import { AudioService, LearningContentService } from '../../services';
import { FooterComponent } from '../../shared/footer/footer';
import { MarkdownContentComponent } from '../../shared/markdown-content';
import { environment } from '../../../environments/environment';
import { AppPageTitle } from '../page-title/page-title';
import type { LearningContent } from '../../interfaces';

@Component({
  selector: 'app-english-listening',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxPrintModule,
    MarkdownContentComponent,
    MatDividerModule,
    MatTooltipModule,
    MatToolbarModule,
    AsyncPipe,
    FooterComponent,
    TranslocoModule,
  ],
  standalone: true,
  templateUrl: './english-listening.component.html',
  styleUrls: ['./english-listening.component.scss'],
  host: {
    class: 'app-main-content',
  },
})
export class EnglishListeningComponent implements OnInit {
  allFiles: LearningContent[] = [];
  selectedFile?: LearningContent;
  currentStatus: EnglishListeningUIStatus = {
    status: EnglishListeningStatusEnum.LessonList,
    startTime: new Date(),
    endTime: new Date(),
  };
  // Lesson list page
  dataSourceLesson = new MatTableDataSource<EnglishListeningLesson>();
  displayedLessonColumns: string[] = ['title', 'sectioncount', 'supplementary'];
  paginatorLesson!: MatPaginator;
  @ViewChild('pgLessonList', { static: false }) set paginatorLesson_Content(content: MatPaginator) {
    if (content) {
      // initially setter gets called with undefined
      this.paginatorLesson = content;
      this.dataSourceLesson.paginator = this.paginatorLesson;
    }
  }
  // Section list page
  selectedLesson?: EnglishListeningLesson;
  //private _questions: QuestionBankItemBase<string>[] | null = [];
  dataSourceSection = new MatTableDataSource<EnglishListeningSection>();
  displayedSectionColumns: string[] = ['title', 'contentcount', 'vocabulary'];
  paginatorSection!: MatPaginator;
  @ViewChild('pgSectionList', { static: false }) set paginatorSection_Content(
    content: MatPaginator
  ) {
    if (content) {
      // initially setter gets called with undefined
      this.paginatorSection = content;
      this.dataSourceSection.paginator = this.paginatorSection;
    }
  }
  // Section detail page
  selectedSection?: EnglishListeningSection;
  dataSourceSectionContent = new MatTableDataSource<EnglishListeningExercise>();
  displayedSectionContentColumns: string[] = ['title', 'item'];
  paginatorSectionContent!: MatPaginator;
  @ViewChild('pgSectionContentList', { static: false }) set paginatorSectionContent_content(
    content: MatPaginator
  ) {
    if (content) {
      // initially setter gets called with undefined
      this.paginatorSectionContent = content;
      this.dataSourceSectionContent.paginator = this.paginatorSectionContent;
    }
  }
  // Title
  pageTitle: AppPageTitle = inject(AppPageTitle);
  // Exercise
  selectedSectionExerciseItems?: QuestionBankItemBase<string>[];
  //selectedSectionExerciseItems?: EnglishListeningExercise[];
  inputContents = viewChildren('inputcontent', { read: MatInput });
  exerciseInputs: WritableSignal<WritableSignal<string>[]> = signal([]);
  expectedresult: string[] = [];
  exerciseContent: EnglishListeningUIInputContent[] = [];
  // Dialog
  private readonly dialog = inject(MatDialog);
  private readonly learningContent = inject(LearningContentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  // Audio
  private readonly audiosrv = inject(AudioService);
  state$ = this.audiosrv.state$;
  pos$ = this.audiosrv.position$;
  dur$ = this.audiosrv.duration$;
  progress$ = this.audiosrv.progress$;
  // Display
  currentItemTitle = '';
  totalItemsInSection = 0;
  currentItemIndexInSection = 0;
  markdownStr: string = '';
  hideLabelOfQuestionType: QuestionBankTypeKeys[] = [];
  showScripts = false;
  currentScripts: string[] = [];
  showAnswer = false;
  currentAnswer: string = '';

  constructor() {
    // Constructor
  }

  get isLessonListPage(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.LessonList;
  }
  get isSectionListPage(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.SectionList;
  }
  get isSectionDetailPage(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.SectionDetail;
  }
  get isExerciseInProcess(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.InExercise;
  }
  get isExerciseCompleted(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.Completed;
  }
  get isSupplementaryPage(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.Supplementary;
  }
  get isVocabularyPage(): boolean {
    return this.currentStatus.status === EnglishListeningStatusEnum.Vocabulary;
  }

  ngOnInit(): void {
    this.pageTitle.title = 'Listening';

    this.learningContent
      .getListeningContents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: df => {
        this.allFiles = df;
        // OnPush: the file list arrives in an async subscribe callback, so the
        // view is not marked dirty automatically — without this the files
        // dropdown stays empty until a later DOM event triggers detection.
        this.cdr.markForCheck();
      },
      error: err => {
        console.error(err);
      },
    });
  }

  // Lesson list
  onFileSelectionChanged(event: MatSelectChange) {
    if (event.value.fileUrl === undefined) {
      this.dataSourceLesson.data = [];
      return;
    }

    this.learningContent
      .getListeningFileContent(event.value.fileUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (df?: EnglishListeningLesson[]) => {
        if (df) {
          this.dataSourceLesson.data = df.slice();
          this.dataSourceLesson.paginator = this.paginatorLesson;
        }
      },
      error: err => {
        console.error(err);
      },
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceLesson.filter = filterValue.trim().toLowerCase();
  }

  openSectionList(sel: EnglishListeningLesson) {
    this.selectedLesson = sel;

    this.dataSourceSection.data = this.selectedLesson.sections;
    this.dataSourceSection.paginator = this.paginatorSection;

    this.currentStatus.status = EnglishListeningStatusEnum.SectionList;
  }

  // Section list
  applySectionFilter(_event: Event) {}

  openSectionDetail(section: EnglishListeningSection) {
    this.selectedSection = section;

    this.dataSourceSectionContent.data = this.selectedSection.exercises!;
    this.dataSourceSectionContent.paginator = this.paginatorSectionContent;

    // Play the content
    this.currentStatus.status = EnglishListeningStatusEnum.SectionDetail;
  }
  onReturnToLessonList() {
    this.selectedLesson = undefined;
    this.currentStatus.status = EnglishListeningStatusEnum.LessonList;
  }
  onPlaySection() {
    // Chose the first item and jump inside
    if (
      this.selectedSection &&
      this.selectedSection.exercises &&
      this.selectedSection.exercises.length > 0
    ) {
      const firstContent = this.selectedSection.exercises[0];
      this.currentItemIndexInSection = 0;
      this.totalItemsInSection = this.selectedSection.exercises.length;
      this.startExercise(firstContent, false);
    }
  }
  onPreviousItem() {
    if (this.selectedSection?.exercises && this.currentItemIndexInSection > 0) {
      this.audiosrv.stop();

      this.currentItemIndexInSection--;
      const prev = this.selectedSection.exercises[this.currentItemIndexInSection];
      if (prev) {
        this.startExercise(prev, false);
      }
    }
  }
  onNextItem() {
    if (
      this.selectedSection?.exercises &&
      this.currentItemIndexInSection < this.totalItemsInSection - 1
    ) {
      this.audiosrv.stop();

      this.currentItemIndexInSection++;
      const next = this.selectedSection.exercises[this.currentItemIndexInSection];
      if (next) {
        this.startExercise(next, false);
      }
    }
  }
  displayVocabulary(section: EnglishListeningSection) {
    if (this.isVocabularyPage) {
      this.currentStatus.status = EnglishListeningStatusEnum.SectionList;
      this.selectedSection = undefined;
    } else {
      this.selectedSection = section;
      this.currentStatus.status = EnglishListeningStatusEnum.Vocabulary;
    }
  }

  // Start Exercise
  startExercise(content: EnglishListeningExercise, updateIndex: boolean = true) {
    let audiofile = '';
    if (content.item && content.item.audioReference) {
      audiofile = `${environment.apiUrl}/api/Storage/englishlistening/${content.item.audioReference.audioFile}`;
      // } else if(content.collection && content.collection.audioReference) {
      //   audiofile = `${environment.apiUrl}/api/Storage/englishlistening/${content.collection!.audioReference!.audioFile}`;
    } else if (this.selectedLesson?.audioFolder) {
      // Use the folder defined on the lesson level
      if (content.item) {
        audiofile = `${environment.apiUrl}/api/Storage/englishlistening/${this.selectedLesson?.audioFolder}/${content.item.id}.mp3`;
        // } else if(content.collection) {
        //   audiofile = `${environment.apiUrl}/api/Storage/englishlistening/${this.selectedLesson?.audioFolder!}/${content.collection.id}.mp3`;
      }
    }

    if (!audiofile) {
      // Fall back to the file defined on the lesson level
      audiofile = this.selectedLesson?.audioFile
        ? `${environment.apiUrl}/api/Storage/englishlistening/${this.selectedLesson.audioFile}`
        : '';
    }

    if (audiofile) {
      if (
        this.audiosrv.audioInstance &&
        this.audiosrv.audioInstance.state() === 'loaded' &&
        this.audiosrv.currentAudioFile === audiofile
      ) {
      } else {
        this.audiosrv.load(audiofile, { autoplay: false, html5: true });
      }
    }

    if (content && content.item) {
      this.selectedSectionExerciseItems = [convertToQuestionBankItem(content.item)];
      // } else {
      //   this.selectedSectionExerciseItems = content.collection?.items!.map((item) => convertToQuestionBankItem(item));
    }
    this.currentItemTitle = content.title || '';
    this.currentScripts = content.scripts || [];
    if (updateIndex) {
      this.totalItemsInSection = 0;
      this.currentItemIndexInSection = 0;
    }

    if (this.selectedSectionExerciseItems && this.selectedSectionExerciseItems.length > 0) {
      this.markdownStr = '';
      this.currentAnswer = '';
      this.selectedSectionExerciseItems.forEach((qtn, idx) => {
        qtn.order = idx + 1;
        this.markdownStr +=
          convertQuestionBankItemToMarkdown(qtn, this.hideLabelOfQuestionType) +
          (idx === this.selectedSectionExerciseItems!.length - 1 ? '' : '<br>');

        // Prepare the answer
        this.currentAnswer +=
          convertQuestionBankItemAnswerToMarkdown(qtn) +
          (idx === this.selectedSectionExerciseItems!.length - 1 ? '' : '<br>');
      });
    }

    // Prepare the content
    this.expectedresult = [];
    this.currentStatus.status = EnglishListeningStatusEnum.InExercise;
  }

  onToggleScripts() {
    // Display the script
    this.showScripts = !this.showScripts;
  }
  onToggleAnswer() {
    this.showAnswer = !this.showAnswer;
  }
  onReturnToSectionList() {
    this.audiosrv.stop();

    this.selectedSection = undefined;
    this.showScripts = false;
    this.currentScripts = [];
    this.showAnswer = false;
    this.currentAnswer = '';
    this.currentStatus.status = EnglishListeningStatusEnum.SectionList;
  }

  // Exercise page
  onPlayAudio() {
    // this.audiosrv.playListeningAudio('content');
    this.audiosrv.play();
  }
  onPauseAudio() {
    this.audiosrv.pause();
  }
  onStopAudio() {
    this.audiosrv.stop();
  }
  onReturnToSectionDetail() {
    //this.selectedSectionExerciseItem = undefined;
    this.showScripts = false;
    this.currentScripts = [];
    this.showAnswer = false;
    this.currentAnswer = '';

    this.currentStatus.status = EnglishListeningStatusEnum.SectionDetail;
  }
  onCheckResult() {
    const result: EnglishListeningUICheckResult[] = [];
    // if (this.selectedSectionExercise!.fillcontent) {
    //   // Verify the result
    //   if (this.inputContents().length > 0) {
    //     for (let i = 0; i < this.inputContents().length; i++) {
    //       result.push({
    //         expected: this.expectedresult[i],
    //         inputted: this.inputContents()[i]?.value
    //       });
    //     }
    //   }
    // } else {
    //   for (let i = 0; i < this.selectedSectionExercise!.answers.length; i++) {
    //     result.push({
    //       expected: this.expectedresult[i],
    //       inputted: this.exerciseInputs()[i]()
    //     });
    //   }
    // }

    this.dialog.open(EnglishListeningCheckResultDialogComponent, {
      data: {
        result: result,
      },
      width: '500px',
      height: '500px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }

  // Supplementary reading
  toggleSupplementary(lesson: EnglishListeningLesson) {
    if (this.isSupplementaryPage) {
      this.currentStatus.status = EnglishListeningStatusEnum.SectionList;
      this.selectedLesson = undefined;
    } else {
      this.selectedLesson = lesson;
      this.currentStatus.status = EnglishListeningStatusEnum.Supplementary;
    }
  }
}

@Component({
  selector: 'app-english-listening-checkrst-dialog',
  templateUrl: 'english-listening-checkrst-dialog.html',
  imports: [
    MatTableModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnglishListeningCheckResultDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EnglishListeningCheckResultDialogComponent>);
  //readonly wordQueueCount = this.data.wordQueueCount;
  readonly displayedResultColumns: string[] = ['expected', 'inputted'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { result: EnglishListeningUICheckResult[] }) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
