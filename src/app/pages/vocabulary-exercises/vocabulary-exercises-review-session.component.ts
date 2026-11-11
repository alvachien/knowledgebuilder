import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { UserLearningTimeService } from '../../services';

import { VocabularyExercisesAutoPlayOptionsDialogComponent } from './vocabulary-exercises-autoplayoptions-dialog.component';
import { VocabularyReviewSessionStore } from './vocabulary-exercises-review-session.store';

/**
 * Review screen of the vocabulary exercises page. All interactions sit in one
 * wrapping toolbar: progress bar with position count, the Review label, the
 * 1-5 rating toggles, and the action fabs - Auto Play settings (interval /
 * randomized order / read example sentences), play/pause/stop (a
 * stopped/playing/paused machine), re-read, previous, next and quit. The
 * content area shows the word, its gloss, and the explanation/example tables,
 * highlighting the sentence being read aloud.
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
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-review-session.component.html',
  styleUrl: './vocabulary-exercises-review-session.component.scss',
})
export class VocabularyExercisesReviewSessionComponent {
  protected readonly store = inject(VocabularyReviewSessionStore);
  protected readonly dialog = inject(MatDialog);
  protected readonly destroyRef = inject(DestroyRef);

  readonly hideExplain = input.required<boolean>();

  readonly quit = output<void>();

  /** Example-sentence table rows, queried by the `#exampleRow` template refs. */
  private readonly exampleRows = viewChildren<ElementRef>('exampleRow');

  private readonly learningTime = inject(UserLearningTimeService);

  constructor() {
    // Keep the sentence currently being read visible: auto play can keep
    // running while the user has scrolled elsewhere in a long entry. The
    // rows exist by the time a reading starts (the sentences render with
    // the dictionary entry, the reading follows it).
    effect(() => {
      const index = this.store.readingSentenceIndex();
      if (index < 0) {
        return;
      }
      this.exampleRows()[index]?.nativeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    // Auto play is studying even when nothing is typed: each word change and
    // each sentence the reader starts counts as activity for the heartbeat.
    effect(() => {
      this.store.cursor();
      if (this.store.isAutoMode()) {
        this.learningTime.markActivity();
      }
    });
    effect(() => {
      const index = this.store.readingSentenceIndex();
      if (index >= 0 && this.store.isAutoMode()) {
        this.learningTime.markActivity();
      }
    });
  }

  /**
   * Open the Auto Play settings dialog (interval, randomized walk order,
   * sentences to read). Cancel/backdrop leaves the current settings
   * untouched. During a running cycle the interval applies immediately (the
   * live tick is re-armed), the sentence count applies from the next item,
   * and randomizing takes effect on the next start.
   */
  protected onAutoPlaySettings(): void {
    const dialogRef = this.dialog.open(VocabularyExercisesAutoPlayOptionsDialogComponent, {
      data: {
        currentSettings: {
          intervalSeconds: this.store.autoModeSeconds(),
          randomizeWords: this.store.autoPlayRandomize(),
          sentencesToRead: this.store.autoPlaySentences(),
        },
      },
      width: '420px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.store.applyAutoPlaySettings(result);
        }
      });
  }

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

    // Keys typed into a form control belong to that control: arrows spin the
    // settings dialog's number inputs and Escape closes the dialog - neither
    // must re-rate the current word nor quit the session. Dialogs and open
    // dropdown panels live in a cdk overlay, so match that too.
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
