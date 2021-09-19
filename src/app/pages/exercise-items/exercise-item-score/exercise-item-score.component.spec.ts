import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseItemScoreComponent } from './exercise-item-score.component';

describe('ExerciseItemScoreComponent', () => {
  let component: ExerciseItemScoreComponent;
  let fixture: ComponentFixture<ExerciseItemScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseItemScoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
