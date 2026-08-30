import { ChangeDetectionStrategy, Component, HostListener, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { VocabularySpellingSessionStore } from './vocabulary-exercises-spelling-session.store';

/**
 * Spelling screen of the vocabulary exercises page: progress bar, hint/next-word
 * controls, the (optionally hidden) explanation and the per-letter input row.
 * All spelling state lives in the injected session store; this component renders
 * it and owns the keyboard listener, so keystroke handling is registered only
 * while the spelling screen is alive (the container's @switch destroys it).
 */
@Component({
  selector: 'app-vocabulary-exercises-spelling-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-spelling-session.component.html',
  styleUrl: './vocabulary-exercises-spelling-session.component.scss',
})
export class VocabularyExercisesSpellingSessionComponent {
  protected readonly store = inject(VocabularySpellingSessionStore);

  readonly hideExplain = input.required<boolean>();

  readonly quit = output<void>();

  /**
   * Spelling input: forward word characters (and Backspace) to the store,
   * nothing else. Only single-character keys count as typing; named keys are
   * ignored — forwarding them would mark the current word incorrect (the
   * Shift keyup trailing a capital letter, CapsLock toggles, focus navigation
   * via Enter/Tab, a button activated via Enter/Space that would also "type"
   * the same key on keyup, arrow/F-keys, ...). Escape quits the session, like
   * on the review screen. Space from anywhere else stays typeable: phrases
   * contain spaces.
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (event.key === 'Escape') {
      this.quit.emit();
      return;
    }

    const key = event.key;
    if (key !== 'Backspace' && key.length !== 1) {
      return;
    }

    if (key === ' ') {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button')) {
        return;
      }
    }

    this.store.handleKey(key);
  }
}
