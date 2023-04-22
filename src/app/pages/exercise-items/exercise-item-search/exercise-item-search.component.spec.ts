import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { AppUIModule } from 'src/app/app-ui.module';

import { ExerciseItemSearchComponent } from './exercise-item-search.component';
import { ODataService, UIUtilityService } from 'src/app/services';
import { of } from 'rxjs';
import { SafeAny } from 'src/app/common';
import { GeneralFilterOperatorEnum, GeneralFilterValueType } from 'src/app/models';

describe('ExerciseItemSearchComponent', () => {
  let component: ExerciseItemSearchComponent;
  let fixture: ComponentFixture<ExerciseItemSearchComponent>;
  let odataservice: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let searchExerciseItemsSpy: SafeAny;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', ['searchExerciseItems']);
    searchExerciseItemsSpy = odataservice.searchExerciseItems.and.returnValue(of({}));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        MaterialModulesModule,
        AppUIModule,
        getTranslocoModule(),
      ],
      declarations: [ExerciseItemSearchComponent],
      providers: [UIUtilityService, 
        { provide: ODataService, useValue: odataservice }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemSearchComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('working with data', () => {
    beforeEach(() => {
      searchExerciseItemsSpy.and.returnValue(asyncData({
        totalCount: 0,
        items: []
      }));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      discardPeriodicTasks();
      flush();
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

      discardPeriodicTasks();
      flush();
    }));

    it('search with content and equal', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.filters[0].fieldName = 'Content';
      component.filters[0].operator = GeneralFilterOperatorEnum.Equal;
      component.filters[0].value = ['test', ''];
      component.onFieldSelectionChanged(component.filters[0]);
      expect(component.filters[0].valueType).toEqual(GeneralFilterValueType.string);

      component.onSearch();
      expect(component.resultsLength).toEqual(0);
      discardPeriodicTasks();
      flush();
    }));
  });
});
