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

import type { VocabularyWorksheetOption } from '../../interfaces';
import { DEFAULT_UNIFORM_BLANK_LENGTH } from '../../interfaces';

@Component({
  selector: 'app-vocabulary-exercises-worksheetoptions-dlg',
  templateUrl: 'vocabulary-exercises-worksheetoptions-dialog.html',
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
export class VocabularyExercisesWorksheetOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesWorksheetOptionsDialogComponent>);

  // Seed every field from the settings currently applied in the container so
  // reopening the dialog shows what the user picked last time.
  readonly countOfItems = model(
    this.data.withSelection ? this.data.wordQueueCount : (this.data.currentSettings?.countOfItems ?? 20)
  );
  readonly printEntryDate = model(this.data.currentSettings?.printEntryDate ?? true);
  // Round-trip the saved subtitle: a previously stored custom subtitle wins
  // over the file name; only fall back to the file name when none was saved
  // (M12). Every other field already round-trips via currentSettings.
  readonly subTitle = model(this.data.currentSettings?.subTitle ?? this.data.title ?? '');
  readonly printFirstLetter = model(this.data.currentSettings?.printFirstLetter ?? false);
  // Uniform blank: hides the answer's length. Default ON (preserves legacy behavior).
  readonly uniformBlankLength = model(this.data.currentSettings?.uniformBlankLength ?? true);
  // Width in &nbsp; cells (default 30, floored to MIN_UNIFORM_BLANK_LENGTH = 10 by the converter).
  readonly uniformBlankLengthSize = model(
    this.data.currentSettings?.uniformBlankLengthSize ?? DEFAULT_UNIFORM_BLANK_LENGTH
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      wordQueueCount: number;
      withSelection: boolean;
      title?: string;
      currentSettings?: VocabularyWorksheetOption;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
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
    // count (M11). The worksheet ignores the count when rows are selected, so
    // the value is inert there either way.
    const count = this.data.withSelection
      ? Math.max(1, Math.floor(this.data.currentSettings?.countOfItems ?? 20))
      : Math.max(1, Math.floor(this.countOfItems() ?? 1));
    const closedata: VocabularyWorksheetOption = {
      subTitle: this.subTitle(),
      countOfItems: count,
      printEntryDate: this.printEntryDate(),
      printFirstLetter: this.printFirstLetter(),
      uniformBlankLength: this.uniformBlankLength(),
      uniformBlankLengthSize: this.uniformBlankLengthSize(),
    };

    this.dialogRef.close(closedata);
  }
}
