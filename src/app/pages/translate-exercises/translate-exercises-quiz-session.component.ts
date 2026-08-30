import { ChangeDetectionStrategy, Component, HostListener, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { TranslateQuizSessionStore } from './translate-exercises-quiz-session.store';

/**
 * Quiz screen of the sentence (translation) exercises page: progress bar, the
 * current single-choice question (prompt + A-D option buttons with answer
 * feedback) and the next/quit controls. All quiz state lives in the injected
 * session store; this component renders it and owns the keyboard listener, so
 * keystroke handling is registered only while the quiz screen is alive (the
 * container's @switch destroys it).
 */
@Component({
  selector: 'app-translate-exercises-quiz-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  templateUrl: './translate-exercises-quiz-session.component.html',
  styleUrl: './translate-exercises-quiz-session.component.scss',
})
export class TranslateExercisesQuizSessionComponent {
  protected readonly store = inject(TranslateQuizSessionStore);

  readonly quit = output<void>();

  /** Option labels shown in front of each answer candidate. */
  readonly optionKeys = ['A', 'B', 'C', 'D'];

  /**
   * Quiz input: forward answer/advance keys to the store, nothing else.
   * Browser/app chords are never quiz input, and Enter/Space on a focused
   * button already activated that button on keydown (answered the option /
   * advanced) — forwarding the keyup would act a second time, e.g. Enter on
   * an option would answer AND skip straight past the answer feedback.
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button')) {
        return;
      }
    }

    this.store.handleKey(event.key);
  }
}
