import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionCurveComponent } from './function-curve.component';

describe('FunctionCurveComponent', () => {
  let component: FunctionCurveComponent;
  let fixture: ComponentFixture<FunctionCurveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionCurveComponent],
    });
    fixture = TestBed.createComponent(FunctionCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
