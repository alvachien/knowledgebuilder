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

import type { VocabularySelectOption } from '../../../interfaces';
import { SelectionModeEnum } from '../../../interfaces';

@Component({
  selector: 'app-knowledge-exercises-select-dlg',
  templateUrl: 'knowledge-exercises-select-dialog.html',
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
export class KnowledgeExercisesSelectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeExercisesSelectDialogComponent>);
  /** Exposes SelectionModeEnum to the template for @switch on data.mode. */
  readonly SelectionMode = SelectionModeEnum;
  readonly data = inject<SelectDialogData>(MAT_DIALOG_DATA);

  // By Count / Free Selection
  readonly countOfItems = model(20);
  readonly countOfOffset = model(0);
  // By ID
  readonly importIDs = model('');

  get titleKey(): string {
    // Dialog titles match the Quick Selection menu items that open them.
    switch (this.data.mode) {
      case SelectionModeEnum.ByID:
        return 'knowledgeExercises.selectIds';
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

  /**
   * Split the By ID input on commas and/or newlines and drop empties. A
   * `rows="5"` textarea invites newline-separated pastes; normalizing here
   * (and again in the container, defense-in-depth) makes any separator work.
   */
  private parseIdTokens(): string[] {
    return this.importIDs()
      .split(/[\n\r,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  /** True if at least one typed token matches a visible item. When no id list
   *  was supplied (legacy/programmatic callers), skip this check and let the
   *  container's own no-match guard handle it. */
  private hasMatchingToken(): boolean {
    const ids = this.data.visibleIds;
    if (!ids || ids.length === 0) {
      return true;
    }
    const set = new Set(ids);
    return this.parseIdTokens().some(t => set.has(t));
  }

  get isFormInvalid(): boolean {
    switch (this.data.mode) {
      case SelectionModeEnum.ByCount: {
        // Require an integer count >= 1 and an integer offset in [0, rowCount)
        // so an out-of-range offset can't silently wipe the selection.
        const count = this.countOfItems();
        const offset = this.countOfOffset() ?? 0;
        const rowCount = this.data.rowCount;
        const countInvalid = !Number.isInteger(count) || count < 1;
        const offsetInvalid =
          !Number.isInteger(offset) ||
          offset < 0 ||
          (rowCount !== undefined && offset >= rowCount);
        return countInvalid || offsetInvalid;
      }
      case SelectionModeEnum.FreeSelection:
        return !Number.isInteger(this.countOfItems()) || this.countOfItems() < 1;
      case SelectionModeEnum.ByID:
        // Empty input, separator-only input (e.g. ",,,"), or no matching token
        // all disable OK so a no-match paste can't clear the selection.
        return this.parseIdTokens().length === 0 || !this.hasMatchingToken();
      default:
        return false;
    }
  }

  onYesClick(): void {
    const result: VocabularySelectOption = { selectedSelectMode: this.data.mode };
    switch (this.data.mode) {
      case SelectionModeEnum.ByCount: {
        // Clamp count/offset to safe integers as defense-in-depth.
        const rowCount = this.data.rowCount;
        const offset = Math.max(0, Math.floor(this.countOfOffset() ?? 0));
        result.countOfItems = Math.max(1, Math.floor(this.countOfItems() ?? 1));
        result.countOfOffset =
          rowCount !== undefined ? Math.min(offset, Math.max(0, rowCount - 1)) : offset;
        break;
      }
      case SelectionModeEnum.FreeSelection:
        result.countOfItems = Math.max(1, Math.floor(this.countOfItems() ?? 1));
        break;
      case SelectionModeEnum.ByID:
        // Return a clean comma-joined list regardless of how it was pasted.
        result.importIDs = this.parseIdTokens().join(',');
        break;
    }
    this.dialogRef.close(result);
  }
}

/** Dialog data: `mode` is always required; `rowCount` bounds By Count's offset
 *  and `visibleIds` lets By ID validate at least one match. */
interface SelectDialogData {
  mode: SelectionModeEnum;
  rowCount?: number;
  visibleIds?: string[];
}
