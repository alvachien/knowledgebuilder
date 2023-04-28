import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { TagDetailComponent } from './tag-detail.component';
import { ODataService, UIUtilityService } from 'src/app/services';
import { ActivatedRoute, UrlSegment } from '@angular/router';

describe('TagDetailComponent', () => {
  let component: TagDetailComponent;
  let fixture: ComponentFixture<TagDetailComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataSvc: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  let readExerciseItemSpy: any;
  let getTagsSpy: any;
  let activatedRouteStub: ActivatedRouteUrlStub;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'readExerciseItem',
      'getTags',
    ]);

    readExerciseItemSpy = odataSvc.readExerciseItem.and.returnValue(of(''));
    getTagsSpy = odataSvc.getTags.and.returnValue(of(''));
  });

  beforeEach(waitForAsync(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('display', {})] as UrlSegment[]);

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
      providers: [
        UIUtilityService, 
        { provide: ODataService, useValue: odataSvc },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
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

  describe('work with data', () => {
    beforeEach(() => {
      getTagsSpy.and.returnValue({
        totalCount: 0,
        items: [],
      })
    });

    xit('shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));
  });
});
