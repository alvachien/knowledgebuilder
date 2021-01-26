import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleGameComponent } from './puzzle-game.component';

describe('PuzzleGameComponent', () => {
  let component: PuzzleGameComponent;
  let fixture: ComponentFixture<PuzzleGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuzzleGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
