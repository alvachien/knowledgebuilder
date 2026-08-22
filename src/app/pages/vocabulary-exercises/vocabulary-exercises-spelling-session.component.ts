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
   * Spelling input: forward word characters to the store, nothing else.
   * Browser/app chords, focus navigation and button activation keys are not
   * typing — forwarding them would mark the current word incorrect (a button
   * activated via Enter/Space on keydown would also "type" the same key).
   * Escape quits the session, like on the review screen. Space from anywhere
   * else stays typeable: phrases contain spaces.
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

    if (event.key === 'Enter' || event.key === 'Tab') {
      return;
    }

    if (event.key === ' ') {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button')) {
        return;
      }
    }

    this.store.handleKey(event.key);
  }
}
