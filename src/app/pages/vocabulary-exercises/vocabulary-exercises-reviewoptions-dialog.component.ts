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

import type { VocabularyReviewOption } from '../../interfaces';

@Component({
  selector: 'app-vocabulary-exercises-reviewoptions-dlg',
  templateUrl: 'vocabulary-exercises-reviewoptions-dialog.html',
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
export class VocabularyExercisesReviewOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesReviewOptionsDialogComponent>);
  // Seed every field from the settings currently applied in the container so
  // reopening the dialog shows what the user picked last time.
  readonly disableVoice = model(this.data.currentSettings?.disableVoice ?? false);
  readonly hideExplain = model(this.data.currentSettings?.hideExplain ?? false);
  readonly countOfItems = model(
    this.data.withSelection ? this.data.wordQueueCount : (this.data.currentSettings?.countOfItems ?? 20)
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      wordQueueCount: number;
      withSelection: boolean;
      currentSettings?: VocabularyReviewOption;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  /** Disabling both voice and explanation leaves the review screen with no output. */
  get isOutputDisabled(): boolean {
    return this.disableVoice() && this.hideExplain();
  }

  /** A cleared / 0 / negative / fractional count would empty or mis-truncate
   * the queue (prepareWordQueue slices by it). Require an integer >= 1. */
  get isCountInvalid(): boolean {
    const count = this.countOfItems();
    return !Number.isInteger(count) || count < 1;
  }

  onYesClick(): void {
    // With a table selection the count input is disabled (it only advertises
    // how many rows are selected), so return the persisted count untouched —
    // never let the selection size silently overwrite the user's configured
    // count (M11). The exercise itself ignores the count when rows are
    // selected, so the value is inert there either way.
    const count = this.data.withSelection
      ? Math.max(1, Math.floor(this.data.currentSettings?.countOfItems ?? 20))
      : Math.max(1, Math.floor(this.countOfItems() ?? 1));
    const closedata: VocabularyReviewOption = {
      disableVoice: this.disableVoice(),
      hideExplain: this.hideExplain(),
      countOfItems: count,
    };

    this.dialogRef.close(closedata);
  }
}
