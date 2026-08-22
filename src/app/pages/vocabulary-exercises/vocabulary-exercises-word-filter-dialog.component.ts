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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';

import { isPhraseOperator, type WordCondition, type WordMatchOperator } from '../../interfaces';

/**
 * Multi-condition editor for the vocabulary list's Word filter. Seeded with
 * the current conditions (empty array for a new filter). `Close` returns the
 * edited list (an empty list clears the dimension); `Cancel` / backdrop / Esc
 * return `undefined` so the caller leaves the previous filter untouched. The
 * seed is cloned so an edit never mutates the caller's array before Close.
 */
@Component({
  selector: 'app-vocabulary-word-filter-dlg',
  templateUrl: 'vocabulary-exercises-word-filter-dialog.component.html',
  styleUrl: 'vocabulary-exercises-word-filter-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslocoModule,
  ],
})
export class VocabularyExercisesWordFilterDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesWordFilterDialogComponent>);
  // Declared BEFORE `conditions` because field initializers run in
  // declaration order — `conditions`' initializer reads `this.data`, so the
  // seed would be undefined if the order were reversed.
  readonly data = inject<WordCondition[]>(MAT_DIALOG_DATA);
  /** Current conditions for editing; cloned from the seed to avoid leaking edits on cancel. */
  readonly conditions = model<WordCondition[]>(this.data.map(c => ({ ...c })));

  readonly wordOperators: { value: WordMatchOperator; labelKey: string }[] = [
    { value: 'startsWith', labelKey: 'wordOpStartsWith' },
    { value: 'contains', labelKey: 'wordOpContains' },
    { value: 'equal', labelKey: 'wordOpEqual' },
    { value: 'endsWith', labelKey: 'wordOpEndsWith' },
    { value: 'isPhrase', labelKey: 'wordOpIsPhrase' },
    { value: 'notPhrase', labelKey: 'wordOpNotPhrase' },
  ];

  /** Phrase operators need no text; their row disables the text input. */
  isPhraseOp(op: WordMatchOperator): boolean {
    return isPhraseOperator(op);
  }

  onAddCondition(): void {
    this.conditions.set([...this.conditions(), { operator: 'contains', text: '' }]);
  }

  /** True when any text condition's text is blank; blank text is invalid and blocks Close. */
  hasEmptyCondition(): boolean {
    return this.conditions().some(c => !isPhraseOperator(c.operator) && c.text.trim() === '');
  }

  onRemoveCondition(index: number): void {
    const next = this.conditions().slice();
    next.splice(index, 1);
    this.conditions.set(next);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close(this.conditions());
  }
}
