import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  tick,
  waitForAsync,
} from '@angular/core/testing';

import { TypingGameComponent } from './typing-game.component';

describe('TypingGameComponent', () => {
  let component: TypingGameComponent;
  let fixture: ComponentFixture<TypingGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TypingGameComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypingGameComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shall work after initlaized', fakeAsync(() => {
    fixture.detectChanges();

    expect(component).toBeTruthy();

    let iInput = 0;
    for (; iInput <= 26; iInput++) {
      if (component.expectedString.length === component.inputtedString?.length) {
        let ntimes = component.expectedString.length;
        do {
          fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
          fixture.detectChanges();

          ntimes--;
        } while (ntimes > 0);
      }

      const charinput = String.fromCharCode(65 + iInput);
      fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: charinput }));
      fixture.detectChanges();
    }

    iInput = 0;
    for (; iInput <= 9; iInput++) {
      fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: iInput.toString() }));
      fixture.detectChanges();
    }

    tick();
    fixture.detectChanges();

    discardPeriodicTasks();
    flush();
  }));
});
