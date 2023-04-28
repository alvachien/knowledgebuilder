import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { ODataService, UIUtilityService } from 'src/app/services';
import { PreviewComponent } from './preview.component';
import { PreviewNewScoreSheet } from './preview-newscore-sheet';
import { ExerciseItem, ExerciseItemType, KnowledgeItem, KnowledgeItemCategory, TagReferenceType } from 'src/app/models';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataSvc: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  let readKnowledgeItemSpy: any;
  let readExerciseItemSpy: any;
  let getLastestExerciseItemUserScoreSpy: any;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'readKnowledgeItem',
      'readExerciseItem',
      'getLastestExerciseItemUserScore'
    ]);

    readKnowledgeItemSpy = odataSvc.readKnowledgeItem.and.returnValue(of(''));
    readExerciseItemSpy = odataSvc.readExerciseItem.and.returnValue(of(''));
    getLastestExerciseItemUserScoreSpy = odataSvc.getLastestExerciseItemUserScore.and.returnValue(of(''));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MaterialModulesModule,
        MarkdownModule.forRoot({
          loader: HttpClient, // optional, only if you use [src] attribute
          markedOptions: {
            provide: MarkedOptions,
            useValue: {
              gfm: true,
              breaks: false,
              pedantic: false,
              smartLists: true,
              smartypants: false,
            },
          },
        }),
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        PreviewComponent,
        PreviewNewScoreSheet,
      ],
      providers: [
        UIUtilityService, 
        { provide: ODataService, useValue: odataSvc }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      let objki: KnowledgeItem = new KnowledgeItem();;
      objki.ID = 1;
      objki.Content = 'aaa';
      objki.Title = 'aaa';
      objki.ItemCategory = KnowledgeItemCategory.Concept;
      let objei = new ExerciseItem();
      objei.Answer = 'test';
      objei.Content = 'test';
      objei.ItemType = ExerciseItemType.EssayQuestions;
      readKnowledgeItemSpy.and.returnValue(asyncData(objki));
      readExerciseItemSpy.and.returnValue(asyncData(objei));
      getLastestExerciseItemUserScoreSpy.and.returnValue(asyncData({}));
      
      let uisrv = TestBed.inject(UIUtilityService);
      uisrv.previewObjList = [{
          refType: TagReferenceType.ExerciseItem, 
          refId: 12,
        }, {
          refType: TagReferenceType.KnowledgeItem, 
          refId: 12,
        }
      ];
    });

    xit('shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // component.onNextPreviewItem();
      // tick();
      // fixture.detectChanges();

      // component.onPreviousPreviewItem();
      // tick();
      // fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));
  });
});
