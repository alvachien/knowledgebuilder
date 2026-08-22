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

@Component({
  selector: 'app-vocabulary-select-dlg',
  templateUrl: 'vocabulary-exercises-select-dialog.html',
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
export class VocabularySelectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularySelectDialogComponent>);
  /** Exposes SelectionModeEnum to the template for @switch on data.mode. */
  readonly SelectionMode = SelectionModeEnum;
  readonly data = inject<SelectDialogData>(MAT_DIALOG_DATA);

  // By Count / Free Selection
  readonly countOfItems = model(20);
  readonly countOfOffset = model(0);
  // By Word (ByID)
  readonly importWords = model('');

  get titleKey(): string {
    // Dialog titles match the Selection menu items that open them.
    switch (this.data.mode) {
      case SelectionModeEnum.ByID:
        return 'vocabularyExercises.selectWords';
      case SelectionModeEnum.FreeSelection:
        return 'vocabularyExercises.randomSelect';
      case SelectionModeEnum.ByCount:
        return 'vocabularyExercises.sequenceSelect';
      default:
        return 'vocabularyExercises.sequenceSelect';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Split the By Word input on commas and/or newlines and drop empties (M14).
   * A `rows="5"` textarea invites newline-separated pastes; normalizing here
   * (and again in the container, defense-in-depth) makes any separator work.
   * Whitespace is only trimmed around each token, not split on, so multi-word
   * entries like "apple pie" survive intact.
   */
  private parseWordTokens(): string[] {
    return this.importWords()
      .split(/[\n\r,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  /** True if at least one typed token matches a visible word (M14). When no
   *  word list was supplied (legacy/programmatic callers), skip this check and
   *  let the container's own no-match guard handle it. */
  private hasMatchingToken(): boolean {
    const words = this.data.visibleWords;
    if (!words || words.length === 0) {
      return true;
    }
    const set = new Set(words);
    return this.parseWordTokens().some(t => set.has(t));
  }

  get isFormInvalid(): boolean {
    switch (this.data.mode) {
      case SelectionModeEnum.ByCount: {
        // Require an integer count >= 1 and an integer offset in [0, rowCount)
        // so an out-of-range offset can't silently wipe the selection (M13).
        const count = this.countOfItems();
        const offset = this.countOfOffset() ?? 0;
        const rowCount = this.data.rowCount;
        const countInvalid = !Number.isInteger(count) || count < 1;
        const offsetInvalid =
          !Number.isInteger(offset) || offset < 0 || (rowCount != null && offset >= rowCount);
        return countInvalid || offsetInvalid;
      }
      case SelectionModeEnum.FreeSelection:
        return !Number.isInteger(this.countOfItems()) || this.countOfItems() < 1;
      case SelectionModeEnum.ByID:
        // Empty input, separator-only input (e.g. ",,,"), or no matching token
        // all disable OK so a no-match paste can't clear the selection (M14).
        return this.parseWordTokens().length === 0 || !this.hasMatchingToken();
      default:
        return false;
    }
  }

  onYesClick(): void {
    const result: VocabularySelectOption = { selectedSelectMode: this.data.mode };
    switch (this.data.mode) {
      case SelectionModeEnum.ByCount: {
        // Clamp count/offset to safe integers as defense-in-depth (M13).
        const rowCount = this.data.rowCount;
        const offset = Math.max(0, Math.floor(this.countOfOffset() ?? 0));
        result.countOfItems = Math.max(1, Math.floor(this.countOfItems() ?? 1));
        result.countOfOffset =
          rowCount != null ? Math.min(offset, Math.max(0, rowCount - 1)) : offset;
        break;
      }
      case SelectionModeEnum.FreeSelection:
        result.countOfItems = Math.max(1, Math.floor(this.countOfItems() ?? 1));
        break;
      case SelectionModeEnum.ByID:
        // Return a clean comma-joined list regardless of how it was pasted (M14).
        result.importIDs = this.parseWordTokens().join(',');
        break;
    }
    this.dialogRef.close(result);
  }
}

/** Dialog data: `mode` is always required; `rowCount` bounds By Count's offset
 *  (M13) and `visibleWords` lets By Word validate at least one match (M14). */
interface SelectDialogData {
  mode: SelectionModeEnum;
  rowCount?: number;
  visibleWords?: string[];
}
