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

import type { VocabularyDictationOption } from '../../interfaces';

/**
 * Options dialog for the vocabulary dictation exercise. Per spec dictation
 * has no hide-audio / hide-description toggle, so the only field is the item
 * count (disabled when rows are selected, like the other exercise option
 * dialogs). Seeds every field from the settings currently applied in the
 * container so reopening shows the last picks.
 */
@Component({
  selector: 'app-vocabulary-exercises-dictationoptions-dlg',
  templateUrl: 'vocabulary-exercises-dictationoptions-dialog.html',
  styleUrl: 'vocabulary-exercises-options-dialogs.scss',
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
export class VocabularyExercisesDictationOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesDictationOptionsDialogComponent>);

  readonly countOfItems = model(
    this.data.withSelection ? this.data.wordQueueCount : (this.data.currentSettings?.countOfItems ?? 20)
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      wordQueueCount: number;
      withSelection: boolean;
      currentSettings?: VocabularyDictationOption;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  /** A cleared / 0 / negative / fractional count would empty or mis-truncate
   *  the queue (prepareWordQueue slices by it). Require an integer >= 1. */
  get isCountInvalid(): boolean {
    const count = this.countOfItems();
    return !Number.isInteger(count) || count < 1;
  }

  onYesClick(): void {
    // With a table selection the count input is disabled (it only advertises
    // how many rows are selected), so return the persisted count untouched —
    // never let the selection size silently overwrite the user's configured
    // count (mirrors the spelling options dialog, M11). The exercise itself
    // ignores the count when rows are selected, so the value is inert there.
    const count = this.data.withSelection
      ? Math.max(1, Math.floor(this.data.currentSettings?.countOfItems ?? 20))
      : Math.max(1, Math.floor(this.countOfItems() ?? 1));
    const closedata: VocabularyDictationOption = {
      countOfItems: count,
    };

    this.dialogRef.close(closedata);
  }
}
