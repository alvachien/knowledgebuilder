import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_INTERCEPTOR,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';

import type { EnglishListeningLesson, LearningContent } from '../../interfaces';
import { EnglishListeningStatusEnum, QuestionBankTypeEnum } from '../../interfaces';
import { AudioService } from '../../services/audio-service.service';
import { LearningContentService } from '../../services/learning-content.service';
import { AppPageTitle } from '../page-title/page-title';

import { EnglishListeningComponent } from './english-listening.component';

describe('EnglishListeningComponent', () => {
  let component: EnglishListeningComponent;
  let fixture: ComponentFixture<EnglishListeningComponent>;
  let learningContentService: any;
  let audioService: any;
  let pageTitle: AppPageTitle;

  const mockFiles: LearningContent[] = [
    {
      id: 1,
      categoryId: 3,
      nameChinese: 'Book1',
      nameEnglish: 'Book1',
      fileUrl: 'storage/englishlistening/book1.json',
    },
    {
      id: 2,
      categoryId: 3,
      nameChinese: 'Book2',
      nameEnglish: 'Book2',
      fileUrl: 'storage/englishlistening/book2.json',
    },
  ];

  const mockLessons: EnglishListeningLesson[] = [
    {
      title: 'Lesson 1',
      audioFile: 'lesson1.mp3',
      sections: [
        {
          title: 'Section 1',
          exercises: [
            {
              title: 'Exercise 1',
              item: {
                id: '1',
                order: 1,
                itemType: QuestionBankTypeEnum.SingleChoice,
                question: 'Question 1',
                audioReference: {
                  audioFile: 'lesson1.mp3',
                  startTime: 0,
                  endTime: 5000,
                },
              },
              scripts: ['Script 1'],
            },
          ],
        },
      ],
      supplementary: ['Supplementary content'],
    },
    {
      title: 'Lesson 2',
      audioFile: 'lesson2.mp3',
      sections: [],
    },
  ];

  beforeEach(async () => {
    const learningContentSpy = {
      getListeningContents: vi.fn(),
      getListeningFileContent: vi.fn(),
    };
    const audioSpy = {
      load: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      setListeningAudio: vi.fn(),
      playListeningAudio: vi.fn(),
      state$: of('idle'),
      position$: of(0),
      duration$: of(0),
      progress$: of(0),
      audioInstance: undefined,
      currentAudioFile: '',
    };

    // Create a mock class that doesn't have dependencies
    class MockAppPageTitle {
      _title = '';
      _originalTitle = 'Knowledge Builder';

      get title(): string {
        return this._title;
      }

      set title(value: string) {
        this._title = value;
      }
    }

    const mockTitleService = { setTitle: vi.fn() };

    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      translate: vi.fn((key: string) => key),
      activeLang: 'en',
      config: {
        reRenderOnLangChange: true,
        prodMode: false,
      },
      langChanges$: of('en'),
      events$: of(),
    };

    await TestBed.configureTestingModule({
      imports: [EnglishListeningComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LearningContentService, useValue: learningContentSpy },
        { provide: AudioService, useValue: audioSpy },
        { provide: AppPageTitle, useClass: MockAppPageTitle },
        { provide: Title, useValue: mockTitleService },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
        { provide: TRANSLOCO_INTERCEPTOR, useValue: {} },
      ],
    }).compileComponents();

    learningContentService = TestBed.inject(LearningContentService) as any;
    audioService = TestBed.inject(AudioService) as any;
    pageTitle = TestBed.inject(AppPageTitle);

    learningContentService.getListeningContents.mockReturnValue(of(mockFiles));

    fixture = TestBed.createComponent(EnglishListeningComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set page title on init', () => {
      fixture.detectChanges();
      expect(pageTitle.title).toBe('Listening');
    });

    it('should load files on init', () => {
      fixture.detectChanges();
      expect(learningContentService.getListeningContents).toHaveBeenCalled();
      expect(component.allFiles).toEqual(mockFiles);
    });

    it('should mark the OnPush view for check after the file list arrives (no click needed)', () => {
      // Regression: the file list lands in an async subscribe callback (not a
      // template event, not an async pipe). With ChangeDetectionStrategy.OnPush
      // the view is not marked dirty automatically, so the files dropdown stayed
      // empty until a later DOM event triggered detection. The component must
      // call markForCheck() once the list is ready.
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      fixture.detectChanges(); // runs ngOnInit → synchronous of() emit → next

      expect(component.allFiles).toEqual(mockFiles);
      expect(markForCheckSpy).toHaveBeenCalled();
    });

    it('should handle error when loading files fails', () => {
      learningContentService.getListeningContents.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
    });

    it('should initialize with lesson list status', () => {
      fixture.detectChanges();
      expect(component.currentStatus.status).toBe(EnglishListeningStatusEnum.LessonList);
    });
  });

  describe('Status Getters', () => {
    it('should return true for isLessonListPage when on lesson list', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.LessonList;
      expect(component.isLessonListPage).toBe(true);
      expect(component.isSectionListPage).toBe(false);
    });

    it('should return true for isSectionListPage when on section list', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.SectionList;
      expect(component.isSectionListPage).toBe(true);
      expect(component.isLessonListPage).toBe(false);
    });

    it('should return true for isSectionDetailPage when on section detail', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.SectionDetail;
      expect(component.isSectionDetailPage).toBe(true);
    });

    it('should return true for isExerciseInProcess when in exercise', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.InExercise;
      expect(component.isExerciseInProcess).toBe(true);
    });

    it('should return true for isExerciseCompleted when completed', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.Completed;
      expect(component.isExerciseCompleted).toBe(true);
    });

    it('should return true for isSupplementaryPage when on supplementary', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.Supplementary;
      expect(component.isSupplementaryPage).toBe(true);
    });

    it('should return true for isVocabularyPage when on vocabulary', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.Vocabulary;
      expect(component.isVocabularyPage).toBe(true);
    });
  });

  describe('File Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear lesson data when no file is selected', () => {
      component.onFileSelectionChanged({ value: {}, source: {} as any });

      expect(component.dataSourceLesson.data).toEqual([]);
    });

    it('should load lessons when file is selected', () => {
      learningContentService.getListeningFileContent.mockReturnValue(of(mockLessons));

      component.onFileSelectionChanged({ value: { fileUrl: 'storage/englishlistening/book1.json' }, source: {} as any });

      expect(learningContentService.getListeningFileContent).toHaveBeenCalledWith('storage/englishlistening/book1.json');
      expect(component.dataSourceLesson.data).toEqual(mockLessons);
    });

    it('should handle error when loading lessons fails', () => {
      learningContentService.getListeningFileContent.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );
      vi.spyOn(console, 'error');

      component.onFileSelectionChanged({ value: { fileUrl: 'storage/englishlistening/book1.json' }, source: {} as any });

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle undefined lesson data', () => {
      learningContentService.getListeningFileContent.mockReturnValue(of(undefined));

      component.onFileSelectionChanged({ value: { fileUrl: 'storage/englishlistening/book1.json' }, source: {} as any });

      expect(component.dataSourceLesson.data).toEqual([]);
    });
  });

  describe('Filter', () => {
    it('should apply filter to lesson data source', () => {
      const event = {
        target: { value: 'Lesson 1' },
      } as any;

      component.applyFilter(event);

      expect(component.dataSourceLesson.filter).toBe('lesson 1');
    });

    it('should trim and lowercase filter value', () => {
      const event = {
        target: { value: '  TEST  ' },
      } as any;

      component.applyFilter(event);

      expect(component.dataSourceLesson.filter).toBe('test');
    });
  });

  describe('Lesson Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should open section list when lesson is selected', () => {
      const lesson = mockLessons[0];

      component.openSectionList(lesson);

      expect(component.selectedLesson).toEqual(lesson);
      expect(component.dataSourceSection.data).toEqual(lesson.sections);
      expect(component.currentStatus.status).toBe(EnglishListeningStatusEnum.SectionList);
    });

    it('should return to lesson list', () => {
      component.selectedLesson = mockLessons[0];
      component.currentStatus.status = EnglishListeningStatusEnum.SectionList as any;

      component.onReturnToLessonList();

      expect(component.selectedLesson).toBeUndefined();
      expect(component.currentStatus.status).toEqual(EnglishListeningStatusEnum.LessonList);
    });
  });

  describe('Section Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedLesson = mockLessons[0];
    });

    it('should open section detail', () => {
      const section = mockLessons[0].sections[0];

      component.openSectionDetail(section);

      expect(component.selectedSection).toEqual(section);
      expect(component.dataSourceSectionContent.data).toEqual(section.exercises!);
      expect(component.currentStatus.status).toBe(EnglishListeningStatusEnum.SectionDetail);
    });

    it('should return to section list', () => {
      component.selectedSection = mockLessons[0].sections[0];
      component.currentStatus.status = EnglishListeningStatusEnum.SectionDetail as any;

      component.onReturnToSectionList();

      expect(component.selectedSection).toBeUndefined();
      expect(component.currentStatus.status).toEqual(EnglishListeningStatusEnum.SectionList);
    });
  });

  describe('Exercise Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Create fresh copies to avoid cross-test contamination
      component.selectedLesson = structuredClone(mockLessons[0]);
      component.selectedSection = component.selectedLesson.sections[0];
      // Initialize component state
      component.totalItemsInSection = 0;
      component.currentItemIndexInSection = 0;
    });

    it('should start exercise from section', () => {
      // Ensure exercises are properly set
      expect(component.selectedSection?.exercises).toBeDefined();
      expect(component.selectedSection?.exercises?.length).toBe(1);
      expect(component.selectedSection?.exercises?.[0]).toBeDefined();
      expect(component.selectedSection?.exercises?.[0].item).toBeDefined();

      component.onPlaySection();

      expect(component.currentItemIndexInSection).toBe(0);
      expect(component.totalItemsInSection).toBe(1);
      expect(component.currentStatus.status).toBe(EnglishListeningStatusEnum.InExercise);
    });

    it('should not start exercise if no exercises available', () => {
      component.selectedSection!.exercises = [];

      component.onPlaySection();

      expect(component.currentStatus.status).not.toBe(EnglishListeningStatusEnum.InExercise);
    });

    it('should load previous item when available', () => {
      component.selectedSection!.exercises = [
        mockLessons[0].sections[0].exercises![0],
        { ...mockLessons[0].sections[0].exercises![0], title: 'Exercise 2' },
      ];
      component.currentItemIndexInSection = 1;

      component.onPreviousItem();

      expect(audioService.stop).toHaveBeenCalled();
      expect(component.currentItemIndexInSection).toBe(0);
    });

    it('should not go to previous item if at first item', () => {
      component.currentItemIndexInSection = 0;
      const initialIndex = component.currentItemIndexInSection;

      component.onPreviousItem();

      expect(component.currentItemIndexInSection).toBe(initialIndex);
    });

    it('should load next item when available', () => {
      component.selectedSection!.exercises = [
        mockLessons[0].sections[0].exercises![0],
        { ...mockLessons[0].sections[0].exercises![0], title: 'Exercise 2' },
      ];
      component.currentItemIndexInSection = 0;
      component.totalItemsInSection = 2;

      component.onNextItem();

      expect(audioService.stop).toHaveBeenCalled();
      expect(component.currentItemIndexInSection).toBe(1);
    });

    it('should not go to next item if at last item', () => {
      component.selectedSection!.exercises = [mockLessons[0].sections[0].exercises![0]];
      component.currentItemIndexInSection = 0;

      component.onNextItem();

      expect(component.currentItemIndexInSection).toBe(0);
    });

    it('should return to section detail', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.InExercise as any;

      component.onReturnToSectionDetail();

      expect(component.showScripts).toBe(false);
      expect(component.currentScripts).toEqual([]);
      expect(component.showAnswer).toBe(false);
      expect(component.currentAnswer).toBe('');
      expect(component.currentStatus.status).toEqual(EnglishListeningStatusEnum.SectionDetail);
    });
  });

  describe('Audio Controls', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should play audio', () => {
      component.onPlayAudio();

      expect(audioService.play).toHaveBeenCalled();
    });

    it('should pause audio', () => {
      component.onPauseAudio();

      expect(audioService.pause).toHaveBeenCalled();
    });

    it('should stop audio', () => {
      component.onStopAudio();

      expect(audioService.stop).toHaveBeenCalled();
    });
  });

  describe('Supplementary Content', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedLesson = mockLessons[0];
    });

    it('should toggle supplementary content', () => {
      component.toggleSupplementary(mockLessons[0]);

      expect(component.currentStatus.status).toBe(EnglishListeningStatusEnum.Supplementary);
    });

    it('should return from supplementary content to section list', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.Supplementary as any;

      component.toggleSupplementary(mockLessons[0]);

      expect(component.currentStatus.status).toEqual(EnglishListeningStatusEnum.SectionList);
      expect(component.selectedLesson).toBeUndefined();
    });
  });

  describe('Vocabulary', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedLesson = mockLessons[0];
      component.selectedSection = mockLessons[0].sections[0];
    });

    it('should toggle vocabulary display', () => {
      component.displayVocabulary(mockLessons[0].sections[0]);

      expect(component.currentStatus.status).toBe(EnglishListeningStatusEnum.Vocabulary);
      expect(component.selectedSection).toEqual(mockLessons[0].sections[0]);
    });

    it('should return from vocabulary to section list', () => {
      component.currentStatus.status = EnglishListeningStatusEnum.Vocabulary as any;

      component.displayVocabulary(mockLessons[0].sections[0]);

      expect(component.currentStatus.status).toEqual(EnglishListeningStatusEnum.SectionList);
      expect(component.selectedSection).toBeUndefined();
    });
  });

  describe('Scripts', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedLesson = mockLessons[0];
      component.selectedSection = mockLessons[0].sections[0];
      component.currentScripts = ['Script 1', 'Script 2'];
    });

    it('should toggle scripts visibility', () => {
      expect(component.showScripts).toBe(false);

      component.onToggleScripts();

      expect(component.showScripts).toBe(true);

      component.onToggleScripts();

      expect(component.showScripts).toBe(false);
    });
  });

  describe('Answer', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.currentAnswer = 'Test Answer';
    });

    it('should toggle answer visibility', () => {
      expect(component.showAnswer).toBe(false);

      component.onToggleAnswer();

      expect(component.showAnswer).toBe(true);

      component.onToggleAnswer();

      expect(component.showAnswer).toBe(false);
    });
  });

  describe('Data Sources', () => {
    it('should initialize lesson data source', () => {
      expect(component.dataSourceLesson).toBeDefined();
      expect(component.dataSourceLesson.data).toEqual([]);
    });

    it('should initialize section data source', () => {
      expect(component.dataSourceSection).toBeDefined();
      expect(component.dataSourceSection.data).toEqual([]);
    });

    it('should initialize section content data source', () => {
      expect(component.dataSourceSectionContent).toBeDefined();
      expect(component.dataSourceSectionContent.data).toEqual([]);
    });
  });

  describe('Audio Observables', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should expose audio state observable', async () => {
      const state = await firstValueFrom(component.state$);
      expect(state).toBe('idle');
    });

    it('should expose audio position observable', async () => {
      const pos = await firstValueFrom(component.pos$);
      expect(pos).toBe(0);
    });

    it('should expose audio duration observable', async () => {
      const dur = await firstValueFrom(component.dur$);
      expect(dur).toBe(0);
    });

    it('should expose audio progress observable', async () => {
      const progress = await firstValueFrom(component.progress$);
      expect(progress).toBe(0);
    });
  });

  describe('Exercise Content', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedLesson = mockLessons[0];
      component.selectedSection = {
        title: 'Section 1',
        exercises: [
          {
            title: 'Exercise 1',
            item: {
              id: '1',
              order: 1,
              itemType: QuestionBankTypeEnum.SingleChoice,
              question: 'Question 1',
              audioReference: {
                audioFile: 'lesson1.mp3',
                startTime: 0,
                endTime: 5000,
              },
            },
            scripts: ['Script 1'],
          },
        ],
      };
    });

    it('should set current item title when starting exercise', () => {
      component.onPlaySection();

      expect(component.currentItemTitle).toBe('Exercise 1');
    });

    it('should set current scripts when starting exercise', () => {
      component.onPlaySection();

      expect(component.currentScripts).toEqual(['Script 1']);
    });
  });

  describe('Displayed Columns', () => {
    it('should define lesson columns', () => {
      expect(component.displayedLessonColumns).toEqual(['title', 'sectioncount', 'supplementary']);
    });

    it('should define section columns', () => {
      expect(component.displayedSectionColumns).toEqual(['title', 'contentcount', 'vocabulary']);
    });
  });
});
