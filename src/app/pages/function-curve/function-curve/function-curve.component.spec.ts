import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { ActivatedRoute, UrlSegment } from '@angular/router';

import { FunctionCurveComponent } from './function-curve.component';

describe('FunctionCurveComponent', () => {
  let component: FunctionCurveComponent;
  let fixture: ComponentFixture<FunctionCurveComponent>;
  let activatedRouteStub: ActivatedRouteUrlStub;

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
      declarations: [
        FunctionCurveComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    });
    fixture = TestBed.createComponent(FunctionCurveComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
