import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { SafeAny } from 'src/app/common';

import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { SentencesListComponent } from './sentences-list.component';

describe('SentencesListComponent', () => {
  let component: SentencesListComponent;
  let fixture: ComponentFixture<SentencesListComponent>;
  let activatedRouteStub: ActivatedRouteUrlStub;
  let odataSvc: SafeAny;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['readUserHabit']);
  });

  beforeEach(() => {
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
        getTranslocoModule(),
      ],
      declarations: [SentencesListComponent],
      providers: [
        { provide: ODataService, useValue: odataSvc },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    });
    fixture = TestBed.createComponent(SentencesListComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
