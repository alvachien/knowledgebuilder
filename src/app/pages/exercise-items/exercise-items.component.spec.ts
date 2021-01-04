import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseItemsComponent } from './exercise-items.component';

describe('KnowledgeItemsComponent', () => {
  let component: ExerciseItemsComponent;
  let fixture: ComponentFixture<ExerciseItemsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
