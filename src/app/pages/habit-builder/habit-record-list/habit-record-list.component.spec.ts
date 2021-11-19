import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitRecordListComponent } from './habit-record-list.component';

describe('HabitRecordListComponent', () => {
  let component: HabitRecordListComponent;
  let fixture: ComponentFixture<HabitRecordListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabitRecordListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitRecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
