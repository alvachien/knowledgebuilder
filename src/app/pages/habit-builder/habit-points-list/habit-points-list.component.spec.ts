import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitPointsListComponent } from './habit-points-list.component';

describe('HabitPointsListComponent', () => {
  let component: HabitPointsListComponent;
  let fixture: ComponentFixture<HabitPointsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabitPointsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitPointsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
