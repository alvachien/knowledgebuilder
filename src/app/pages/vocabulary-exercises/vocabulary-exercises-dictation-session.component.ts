import { ChangeDetectionStrategy, Component, HostListener, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { VocabularyDictationSessionStore } from './vocabulary-exercises-dictation-session.store';

/**
 * Dictation screen of the vocabulary exercises page: a progress bar, a live
 * "dictating word X / N" status, and a quit control. Per spec there is no input
 * control and no explanation shown - the word is only spoken, never revealed.
 * All dictation state lives in the injected session store; this component
 * renders it and owns the Escape-to-quit keyboard listener, registered only
 * while the dictation screen is alive (the container's @switch destroys it).
 */
@Component({
  selector: 'app-vocabulary-exercises-dictation-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-dictation-session.component.html',
  styleUrl: './vocabulary-exercises-dictation-session.component.scss',
})
export class VocabularyExercisesDictationSessionComponent {
  protected readonly store = inject(VocabularyDictationSessionStore);

  readonly quit = output<void>();

  /**
   * Escape quits the session (parity with the spelling/review screens). No
   * other key does anything - dictation has no typing. Modifier chords are
   * ignored so app/browser shortcuts never trigger a quit.
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (event.key === 'Escape') {
      this.quit.emit();
    }
  }
}
