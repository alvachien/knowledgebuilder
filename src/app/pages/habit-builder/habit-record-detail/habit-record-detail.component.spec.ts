import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitRecordDetailComponent } from './habit-record-detail.component';

describe('HabitRecordDetailComponent', () => {
  let component: HabitRecordDetailComponent;
  let fixture: ComponentFixture<HabitRecordDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabitRecordDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
