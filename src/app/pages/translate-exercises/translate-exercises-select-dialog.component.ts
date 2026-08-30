import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
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

import type { VocabularySelectOption } from '../../interfaces';
import { SelectionModeEnum } from '../../interfaces';

/**
 * Count/offset prompt behind the Selection menu's Random and Sequence items
 * (Free Selection and By Count; there is no by-word selection for sentences).
 * `OK` returns a `VocabularySelectOption`; Cancel / backdrop / Esc return
 * `undefined` so the caller leaves the selection untouched.
 */
@Component({
  selector: 'app-translate-exercises-select-dlg',
  templateUrl: 'translate-exercises-select-dialog.html',
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
export class TranslateExercisesSelectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesSelectDialogComponent>);
  /** Exposes SelectionModeEnum to the template for @switch on data.mode. */
  readonly SelectionMode = SelectionModeEnum;
  readonly data = inject<SelectDialogData>(MAT_DIALOG_DATA);

  readonly countOfItems = model(20);
  readonly countOfOffset = model(0);

  get titleKey(): string {
    // Dialog titles match the Selection menu items that open them.
    switch (this.data.mode) {
      case SelectionModeEnum.FreeSelection:
        return 'common.randomSelect';
      case SelectionModeEnum.ByCount:
        return 'common.sequenceSelect';
      default:
        return 'common.sequenceSelect';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isFormInvalid(): boolean {
    if (this.data.mode === SelectionModeEnum.ByCount) {
      // Require an integer count >= 1 and an integer offset in [0, rowCount)
      // so an out-of-range offset can't silently wipe the selection.
      const count = this.countOfItems();
      const offset = this.countOfOffset() ?? 0;
      const rowCount = this.data.rowCount;
      const countInvalid = !Number.isInteger(count) || count < 1;
      const offsetInvalid =
        !Number.isInteger(offset) || offset < 0 || (rowCount !== undefined && offset >= rowCount);
      return countInvalid || offsetInvalid;
    }
    return !Number.isInteger(this.countOfItems()) || this.countOfItems() < 1;
  }

  onYesClick(): void {
    const result: VocabularySelectOption = { selectedSelectMode: this.data.mode };
    if (this.data.mode === SelectionModeEnum.ByCount) {
      // Clamp count/offset to safe integers as defense-in-depth.
      const rowCount = this.data.rowCount;
      const offset = Math.max(0, Math.floor(this.countOfOffset() ?? 0));
      result.countOfItems = Math.max(1, Math.floor(this.countOfItems() ?? 1));
      result.countOfOffset =
        rowCount !== undefined ? Math.min(offset, Math.max(0, rowCount - 1)) : offset;
    } else {
      result.countOfItems = Math.max(1, Math.floor(this.countOfItems() ?? 1));
    }
    this.dialogRef.close(result);
  }
}

/** Dialog data: `mode` is always required; `rowCount` bounds By Count's offset. */
interface SelectDialogData {
  mode: SelectionModeEnum;
  rowCount?: number;
}
