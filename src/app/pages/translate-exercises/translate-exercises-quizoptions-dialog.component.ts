import { ChangeDetectionStrategy, Component, Inject, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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

import type { SentenceQuizOption } from '../../interfaces';

@Component({
  selector: 'app-translate-exercises-quizoptions-dlg',
  templateUrl: './translate-exercises-quizoptions-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslateExercisesQuizOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesQuizOptionsDialogComponent>);

  // Seed from the settings currently applied in the container so reopening
  // the dialog shows what the user picked last time.
  readonly countOfItems = model(
    this.data.withSelection ? this.data.sentenceQueueCount : (this.data.currentSettings?.countOfItems ?? 20)
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      sentenceQueueCount: number;
      withSelection: boolean;
      currentSettings?: SentenceQuizOption;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  /** A cleared / 0 / negative / fractional count would empty or mis-truncate
   * the queue (the exercise prep slices by it). Require an integer >= 1. */
  get isCountInvalid(): boolean {
    const count = this.countOfItems();
    return !Number.isInteger(count) || count < 1;
  }

  onYesClick(): void {
    // With a table selection the count input is disabled (it only advertises
    // how many rows are selected), so return the persisted count untouched —
    // never let the selection size silently overwrite the user's configured
    // count. The exercise itself ignores the count when rows are selected, so
    // the value is inert there either way.
    const count = this.data.withSelection
      ? Math.max(1, Math.floor(this.data.currentSettings?.countOfItems ?? 20))
      : Math.max(1, Math.floor(this.countOfItems() ?? 1));
    const closedata: SentenceQuizOption = {
      countOfItems: count,
    };

    this.dialogRef.close(closedata);
  }
}
