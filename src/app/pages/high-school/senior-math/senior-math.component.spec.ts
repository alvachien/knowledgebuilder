import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeniorMathComponent } from './senior-math.component';

describe('SeniorMathComponent', () => {
  let component: SeniorMathComponent;
  let fixture: ComponentFixture<SeniorMathComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeniorMathComponent],
    });
    fixture = TestBed.createComponent(SeniorMathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
