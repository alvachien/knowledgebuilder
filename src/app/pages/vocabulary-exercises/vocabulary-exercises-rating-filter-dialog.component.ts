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
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';

import { RatingOperatorEnum } from '../../interfaces';
import type { RatingCondition } from '../../interfaces';

/**
 * Multi-condition editor for the vocabulary list's Rating filter. Same
 * Close/Cancel semantics as the Word filter dialog. Only the 5 value-based
 * operators are offered (>= > = <= <); each row also picks a value 1–5.
 */
@Component({
  selector: 'app-vocabulary-rating-filter-dlg',
  templateUrl: 'vocabulary-exercises-rating-filter-dialog.component.html',
  styleUrl: 'vocabulary-exercises-rating-filter-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatSelectModule,
    TranslocoModule,
  ],
})
export class VocabularyExercisesRatingFilterDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VocabularyExercisesRatingFilterDialogComponent>);
  // Declared BEFORE `conditions` (see Word dialog note): field initializers
  // run in declaration order and `conditions`' initializer reads `this.data`.
  readonly data = inject<RatingCondition[]>(MAT_DIALOG_DATA);
  readonly conditions = model<RatingCondition[]>(this.data.map(c => ({ ...c })));

  readonly ratingOperators: { value: RatingOperatorEnum; symbol: string }[] = [
    { value: RatingOperatorEnum.LargerOrEquals, symbol: '>=' },
    { value: RatingOperatorEnum.GreaterThan, symbol: '>' },
    { value: RatingOperatorEnum.Equals, symbol: '=' },
    { value: RatingOperatorEnum.LessOrEquals, symbol: '<=' },
    { value: RatingOperatorEnum.LessThan, symbol: '<' },
  ];

  readonly ratingValues = [1, 2, 3, 4, 5];

  onAddCondition(): void {
    this.conditions.set([
      ...this.conditions(),
      { operator: RatingOperatorEnum.LargerOrEquals, value: 3 },
    ]);
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
