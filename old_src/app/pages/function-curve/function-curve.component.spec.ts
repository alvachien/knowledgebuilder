import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionCurveComponent } from './function-curve.component';

describe('FunctionCurveComponent', () => {
  let component: FunctionCurveComponent;
  let fixture: ComponentFixture<FunctionCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
