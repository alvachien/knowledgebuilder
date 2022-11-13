import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { ExerciseItemDetailComponent } from './exercise-item-detail.component';

describe('ExerciseItemDetailComponent', () => {
  let component: ExerciseItemDetailComponent;
  let fixture: ComponentFixture<ExerciseItemDetailComponent>;

  let odataSvc: any;
  let readExerciseItemSpy: any;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'getOverviewInfo',
    ]);

    readExerciseItemSpy = odataSvc.readExerciseItem.and.returnValue(of(''));
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MaterialModulesModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [ ExerciseItemDetailComponent ],
      providers: [
        UIUtilityService,
        { provide: ODataService, useValue: odataSvc },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
