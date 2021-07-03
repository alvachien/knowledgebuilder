import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyTraceComponent } from './daily-trace.component';

describe('DailyTraceComponent', () => {
  let component: DailyTraceComponent;
  let fixture: ComponentFixture<DailyTraceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyTraceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyTraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
