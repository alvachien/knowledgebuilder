import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SudouComponent } from './sudou.component';

describe('SudouComponent', () => {
  let component: SudouComponent;
  let fixture: ComponentFixture<SudouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SudouComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SudouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
