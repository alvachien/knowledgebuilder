import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseItemSearchComponent } from './exercise-item-search.component';

describe('ExerciseItemSearchComponent', () => {
  let component: ExerciseItemSearchComponent;
  let fixture: ComponentFixture<ExerciseItemSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseItemSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
