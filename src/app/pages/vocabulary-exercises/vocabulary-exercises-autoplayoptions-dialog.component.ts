import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';

import type { VocabularyAutoPlayOption } from '../../interfaces';

/**
 * Auto Play settings dialog of the vocabulary review screen: the seconds per
 * item interval, whether auto play walks the items in a random order (only
 * the traversal - the study queue itself is never re-ordered), and how many
 * dictionary example sentences (0-10) are read aloud through the Web Speech
 * API after each word's pronunciation. A changed interval re-arms the live
 * tick immediately; the sentence count applies from the next item and the
 * walk order from the next auto-play start. Like the other options dialogs,
 * currentSettings round-trips so reopening shows the last picks.
 */
@Component({
  selector: 'app-vocabulary-exercises-autoplayoptions-dlg',
  templateUrl: 'vocabulary-exercises-autoplayoptions-dialog.html',
  styleUrl: 'vocabulary-exercises-options-dialogs.scss',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VocabularyExercisesAutoPlayOptionsDialogComponent {
  /** Interval bounds: 1s brisk cycling up to a deliberate 120s pace. */
  private static readonly MIN_INTERVAL_SECONDS = 1;
  private static readonly MAX_INTERVAL_SECONDS = 120;
  /** /api/WordDictionary caps an entry's example list at 10. */
  private static readonly MAX_SENTENCES_TO_READ = 10;

  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesAutoPlayOptionsDialogComponent>);
  readonly intervalSeconds = model(this.data.currentSettings?.intervalSeconds ?? 5);
  readonly randomizeWords = model(this.data.currentSettings?.randomizeWords ?? false);
  readonly sentencesToRead = model(this.data.currentSettings?.sentencesToRead ?? 0);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentSettings?: VocabularyAutoPlayOption;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  /** A cleared / fractional / out-of-range interval would stall or flood the
   * auto-advance timer; the store's own validation would ignore it anyway. */
  get isIntervalInvalid(): boolean {
    const seconds = this.intervalSeconds();
    return (
      !Number.isInteger(seconds) ||
      seconds < VocabularyExercisesAutoPlayOptionsDialogComponent.MIN_INTERVAL_SECONDS ||
      seconds > VocabularyExercisesAutoPlayOptionsDialogComponent.MAX_INTERVAL_SECONDS
    );
  }

  /** 0 turns sentence reading off; above the server cap the extra slots are dead. */
  get isSentencesInvalid(): boolean {
    const count = this.sentencesToRead();
    return (
      !Number.isInteger(count) ||
      count < 0 ||
      count > VocabularyExercisesAutoPlayOptionsDialogComponent.MAX_SENTENCES_TO_READ
    );
  }

  get isInvalid(): boolean {
    return this.isIntervalInvalid || this.isSentencesInvalid;
  }

  onYesClick(): void {
    if (this.isInvalid) {
      return;
    }
    const closedata: VocabularyAutoPlayOption = {
      intervalSeconds: this.intervalSeconds(),
      randomizeWords: this.randomizeWords(),
      sentencesToRead: this.sentencesToRead(),
    };
    this.dialogRef.close(closedata);
  }
}
