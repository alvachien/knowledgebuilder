import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizFailureDailogComponent } from './quiz-failure-dailog.component';

describe('QuizFailureDailogComponent', () => {
  let component: QuizFailureDailogComponent;
  let fixture: ComponentFixture<QuizFailureDailogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizFailureDailogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizFailureDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
