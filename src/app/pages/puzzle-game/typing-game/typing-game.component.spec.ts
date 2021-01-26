import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypingGameComponent } from './typing-game.component';

describe('TypingGameComponent', () => {
  let component: TypingGameComponent;
  let fixture: ComponentFixture<TypingGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypingGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypingGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
