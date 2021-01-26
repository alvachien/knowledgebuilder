import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GobangGameComponent } from './gobang-game.component';

describe('GobangGameComponent', () => {
  let component: GobangGameComponent;
  let fixture: ComponentFixture<GobangGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GobangGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GobangGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
