import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';

import { ODataService, UIUtilityService } from 'src/app/services';
import { ExerciseItemDetailComponent } from './exercise-item-detail.component';
import { SafeAny } from 'src/app/common';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { UIMode } from 'actslib';
import { ExerciseItem, ExerciseItemType } from 'src/app/models';

describe('ExerciseItemDetailComponent', () => {
  let component: ExerciseItemDetailComponent;
  let fixture: ComponentFixture<ExerciseItemDetailComponent>;
  let odataSvc: SafeAny;
  let readExerciseItemSpy: SafeAny;
  let createExerciseItemSpy: SafeAny;
  let changeExerciseItemSpy: SafeAny;
  let activatedRouteStub: ActivatedRouteUrlStub;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'readExerciseItem',
      'createExerciseItem',
      'changeExerciseItem',
    ]);

    readExerciseItemSpy = odataSvc.readExerciseItem.and.returnValue(of(''));
    createExerciseItemSpy = odataSvc.createExerciseItem.and.returnValue(of(''));
    changeExerciseItemSpy = odataSvc.changeExerciseItem.and.returnValue(of(''));
  });

  beforeEach(waitForAsync(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MaterialModulesModule,
        BrowserDynamicTestingModule,
        NuMonacoEditorModule.forRoot(),
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
        getTranslocoModule(),
      ],
      declarations: [
        ExerciseItemDetailComponent
      ],
      providers: [
        UIUtilityService, 
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ODataService, useValue: odataSvc }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      readExerciseItemSpy.and.returnValue(of(''));
      createExerciseItemSpy.and.returnValue(of(''));
      changeExerciseItemSpy.and.returnValue(of(''));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Create);
      expect(component.isCreateMode).toBeTrue();
      expect(component.isUpdateMode).toBeFalse();
      expect(component.isDisplayMode).toBeFalse();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      let objtbt = new ExerciseItem();
      objtbt.Answer = 'test';
      objtbt.Content = 'test';
      objtbt.ItemType = ExerciseItemType.EssayQuestions;
  
      readExerciseItemSpy.and.returnValue(asyncData(objtbt));
      createExerciseItemSpy.and.returnValue(of(''));
      changeExerciseItemSpy.and.returnValue(of(''));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Display);
      expect(component.isCreateMode).toBeFalse();
      expect(component.isUpdateMode).toBeFalse();
      expect(component.isDisplayMode).toBeTrue();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('navigation shall work', () => {
    it('navigation to list shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
    
      component.onReturnToList();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));

    it('navigation to new create page shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
    
      component.onCreateNewOne();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));
  });
});

