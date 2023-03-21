import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { TagDetailComponent } from './tag-detail.component';
import { ODataService, UIUtilityService } from 'src/app/services';

describe('TagDetailComponent', () => {
  let component: TagDetailComponent;
  let fixture: ComponentFixture<TagDetailComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataSvc: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readExerciseItemSpy: any;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['readExerciseItem']);

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
      declarations: [TagDetailComponent],
      providers: [UIUtilityService, { provide: ODataService, useValue: odataSvc }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
