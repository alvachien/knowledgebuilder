import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseItemDetailComponent } from './exercise-item-detail.component';

describe('ExerciseItemDetailComponent', () => {
  let component: ExerciseItemDetailComponent;
  let fixture: ComponentFixture<ExerciseItemDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
