import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';

import { ODataService, UIUtilityService } from 'src/app/services';
import { ExerciseItemScoreComponent } from './exercise-item-score.component';
import { AppUIModule } from 'src/app/app-ui.module';
import { SafeAny } from 'src/app/common';
import { GeneralFilterOperatorEnum, GeneralFilterValueType } from 'src/app/models';
import { Router } from '@angular/router';

describe('ExerciseItemScoreComponent', () => {
  let component: ExerciseItemScoreComponent;
  let fixture: ComponentFixture<ExerciseItemScoreComponent>;
  let odataSvc: SafeAny;
  let deleteExerciseItemUserScoreSpy: SafeAny;
  let getExerciseItemUserScoresSpy: SafeAny;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'deleteExerciseItemUserScore',
      'getExerciseItemUserScores'
    ]);

    deleteExerciseItemUserScoreSpy = odataSvc.deleteExerciseItemUserScore.and.returnValue(of(false));
    getExerciseItemUserScoresSpy = odataSvc.getExerciseItemUserScores.and.returnValue(of({}));
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
        BrowserDynamicTestingModule,
        AppUIModule,
        getTranslocoModule(),
      ],
      declarations: [
        ExerciseItemScoreComponent
      ],
      providers: [
        UIUtilityService, 
        { provide: ODataService, useValue: odataSvc }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemScoreComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('working with data', () => {
    beforeEach(() => {
      getExerciseItemUserScoresSpy.and.returnValue(asyncData({
        totalCount: 0,
        items: []
      }));
      deleteExerciseItemUserScoreSpy.and.returnValue(asyncData(true));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
    }));

    it('delete default filter wont work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      // Delte default one, but it will add back
      component.onRemoveFilter(0);
      expect(component.filters.length).toEqual(1);
    }));

    it('search with content and equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Content';
      component.filters[0].operator = GeneralFilterOperatorEnum.Equal;
      component.filters[0].value = ['test', ''];
      component.filters[0].valueType = GeneralFilterValueType.string;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with content and like', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Content';
      component.filters[0].operator = GeneralFilterOperatorEnum.Like;
      component.filters[0].value = ['test', ''];
      component.filters[0].valueType = GeneralFilterValueType.string;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with score and equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Score';
      component.filters[0].operator = GeneralFilterOperatorEnum.Equal;
      component.filters[0].value = [1];
      component.filters[0].valueType = GeneralFilterValueType.number;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with score and between', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Score';
      component.filters[0].operator = GeneralFilterOperatorEnum.Between;
      component.filters[0].value = [1, 20];
      component.filters[0].valueType = GeneralFilterValueType.number;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);

      component.onRefreshList();
      expect(component.resultsLength).toEqual(0);

      component.resetPaging();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with score and larger equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Score';
      component.filters[0].operator = GeneralFilterOperatorEnum.LargerEqual;
      component.filters[0].value = [1];
      component.filters[0].valueType = GeneralFilterValueType.number;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with score and larger than', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Score';
      component.filters[0].operator = GeneralFilterOperatorEnum.LargerThan;
      component.filters[0].value = [1];
      component.filters[0].valueType = GeneralFilterValueType.number;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with score and less equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Score';
      component.filters[0].operator = GeneralFilterOperatorEnum.LessEqual;
      component.filters[0].value = [1];
      component.filters[0].valueType = GeneralFilterValueType.number;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with score and less than', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Score';
      component.filters[0].operator = GeneralFilterOperatorEnum.LessThan;
      component.filters[0].value = [1];
      component.filters[0].valueType = GeneralFilterValueType.number;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with date and equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'TakenDate';
      component.filters[0].operator = GeneralFilterOperatorEnum.Equal;
      component.filters[0].value = ['2022-01-01'];
      component.filters[0].valueType = GeneralFilterValueType.date;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with date and between', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'TakenDate';
      component.filters[0].operator = GeneralFilterOperatorEnum.Between;
      component.filters[0].value = ['2022-01-01', '2022-02-01'];
      component.filters[0].valueType = GeneralFilterValueType.date;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with date and larger equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'TakenDate';
      component.filters[0].operator = GeneralFilterOperatorEnum.LargerEqual;
      component.filters[0].value = ['2022-01-01'];
      component.filters[0].valueType = GeneralFilterValueType.date;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with date and larger than', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'TakenDate';
      component.filters[0].operator = GeneralFilterOperatorEnum.LargerThan;
      component.filters[0].value = ['2022-01-01'];
      component.filters[0].valueType = GeneralFilterValueType.date;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with date and less equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'TakenDate';
      component.filters[0].operator = GeneralFilterOperatorEnum.LessEqual;
      component.filters[0].value = ['2022-01-01'];
      component.filters[0].valueType = GeneralFilterValueType.date;

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));

    it('search with date and less than', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'TakenDate';
      component.filters[0].operator = GeneralFilterOperatorEnum.LessThan;
      component.filters[0].value = ['2022-01-01'];
      component.onFieldSelectionChanged(component.filters[0]);

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
    }));
  });

  describe('test navigation', () => {
    it('onGoToExerciseItems', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onGoToExerciseItems();

      expect(routerstub.navigate).toHaveBeenCalled();
    });
    it('onDisplayExerciseItem', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onDisplayExerciseItem(1);

      expect(routerstub.navigate).toHaveBeenCalled();
    });
    it('onChangeExerciseItem', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onChangeExerciseItem(1);

      expect(routerstub.navigate).toHaveBeenCalled();
    });
  });
});

