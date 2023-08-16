import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuniorMathComponent } from './junior-math.component';

describe('JuniorMathComponent', () => {
  let component: JuniorMathComponent;
  let fixture: ComponentFixture<JuniorMathComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JuniorMathComponent]
    });
    fixture = TestBed.createComponent(JuniorMathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
