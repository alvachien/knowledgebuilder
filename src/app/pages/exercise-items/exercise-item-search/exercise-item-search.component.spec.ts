import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { AppUIModule } from 'src/app/app-ui.module';

import { ExerciseItemSearchComponent } from './exercise-item-search.component';
import { ODataService, UIUtilityService } from 'src/app/services';
import { of } from 'rxjs';

describe('ExerciseItemSearchComponent', () => {
  let component: ExerciseItemSearchComponent;
  let fixture: ComponentFixture<ExerciseItemSearchComponent>;
  let odataservice: any;
  let searchExerciseItemsSpy: any;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', [
      'searchExerciseItems',
    ]);
    searchExerciseItemsSpy = odataservice.searchExerciseItems.and.returnValue(
      of({
        totalCount: 0,
        items: [],
      })
    );
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
      providers: [
        UIUtilityService,
        { provide: ODataService, useValue: odataservice },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
