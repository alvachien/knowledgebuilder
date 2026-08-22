import { ChangeDetectionStrategy, Component, HostListener, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { VocabularyReviewSessionStore } from './vocabulary-exercises-review-session.store';

/**
 * Review screen of the vocabulary exercises page: progress bar, auto-play,
 * previous/next/quit controls and the current word with its rating toggles.
 * All review state lives in the injected session store; this component renders
 * it and owns the keyboard listener, so keystroke handling is registered only
 * while the review screen is alive (the container's @switch destroys it).
 */
@Component({
  selector: 'app-vocabulary-exercises-review-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    FormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-review-session.component.html',
  styleUrl: './vocabulary-exercises-review-session.component.scss',
})
export class VocabularyExercisesReviewSessionComponent {
  /** Interval choices offered by the seconds-per-word selector. */
  protected readonly autoModeSecondChoices = [3, 5, 10];

  protected readonly store = inject(VocabularyReviewSessionStore);

  readonly hideExplain = input.required<boolean>();

  readonly quit = output<void>();

  /**
   * Study keyboard shortcuts: 1-5 rate the current word, ArrowUp/Down nudge
   * the rating, ArrowLeft/Right move through the queue, Esc quits. Manual
   * prev/next are ignored while auto mode is running.
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Browser/app chords are never study input: Alt+ArrowLeft/Right belongs
    // to browser history (the word must not also change), Ctrl/Alt+1…5 must
    // not rate the word.
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    // Keys typed into a form control belong to that control: arrows navigate
    // the seconds-per-word select's options and Escape closes its panel -
    // neither must re-rate the current word nor quit the session. The open
    // dropdown panel lives in a cdk overlay, so match that too.
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'input, textarea, select, mat-select, [contenteditable="true"], .cdk-overlay-pane'
      )
    ) {
      return;
    }

    // While the rating toggle group has focus, it already applies the arrow
    // keys on keydown (Material clicks the neighboring toggle, which changes
    // the rating and sends the upsert). Applying them again here on keyup
    // would change the rating twice, send a duplicate upsert, and let the
    // horizontal arrows navigate the queue at the same time. Number keys and
    // Escape are not handled by the group, so they keep working.
    if (
      (event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight') &&
      target?.closest('mat-button-toggle-group')
    ) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        this.quit.emit();
        break;
      case 'ArrowLeft':
        if (!this.store.isAutoMode()) {
          this.store.previous();
        }
        break;
      case 'ArrowRight':
        if (!this.store.isAutoMode()) {
          this.store.next();
        }
        break;
      case 'ArrowUp':
        this.store.rateCurrent(this.store.currentItem().rating + 1);
        break;
      case 'ArrowDown':
        this.store.rateCurrent(this.store.currentItem().rating - 1);
        break;
      default: {
        const ratingKey = parseInt(event.key, 10);
        if (ratingKey >= 1 && ratingKey <= 5) {
          this.store.rateCurrent(ratingKey);
        } else {
          // Unhandled key: leave the event alone, like the original handler.
          return;
        }
      }
    }
    // NOTE: this only suppresses keyup-triggered defaults. Arrow-key page
    // scrolling happens on keydown and is blocked by handleKeyDownEvent below
    // (L10) — the call here is kept for parity / defensive coverage.
    event.preventDefault();
  }

  /**
   * Block the default *keydown* behavior of the arrow keys (page scroll) while
   * the review screen owns them and no form control / toggle group / button is
   * focused (those need their own keydown behavior). State changes stay on
   * keyup — this listener only stops the browser from scrolling the page on
   * ArrowUp/Down/Left/Right, which the keyup preventDefault cannot (L10).
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const key = event.key;
    if (
      key !== 'ArrowUp' &&
      key !== 'ArrowDown' &&
      key !== 'ArrowLeft' &&
      key !== 'ArrowRight'
    ) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'input, textarea, select, mat-select, [contenteditable="true"], .cdk-overlay-pane, mat-button-toggle-group, button'
      )
    ) {
      return;
    }

    event.preventDefault();
  }
}
