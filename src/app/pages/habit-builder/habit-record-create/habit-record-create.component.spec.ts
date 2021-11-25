import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitRecordCreateComponent } from './habit-record-create.component';

describe('HabitRecordCreateComponent', () => {
  let component: HabitRecordCreateComponent;
  let fixture: ComponentFixture<HabitRecordCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabitRecordCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitRecordCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
