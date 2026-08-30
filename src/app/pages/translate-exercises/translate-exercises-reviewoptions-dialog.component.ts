import { ChangeDetectionStrategy, Component, Inject, inject, model } from '@angular/core';
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

import type { SentenceReviewOption } from '../../interfaces';

@Component({
  selector: 'app-translate-exercises-reviewoptions-dlg',
  templateUrl: './translate-exercises-reviewoptions-dialog.html',
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
export class TranslateExercisesReviewOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesReviewOptionsDialogComponent>);
  // Seed every field from the settings currently applied in the container so
  // reopening the dialog shows what the user picked last time.
  readonly disableVoice = model(this.data.currentSettings?.disableVoice ?? false);
  readonly countOfItems = model(
    this.data.withSelection ? this.data.sentenceQueueCount : (this.data.currentSettings?.countOfItems ?? 20)
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      sentenceQueueCount: number;
      withSelection: boolean;
      currentSettings?: SentenceReviewOption;
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
    const closedata: SentenceReviewOption = {
      disableVoice: this.disableVoice(),
      countOfItems: count,
    };

    this.dialogRef.close(closedata);
  }
}
