import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';

import type { ChineseReciteOption } from '../../interfaces';
import {
  QuestionBankItemLevelEnum,
  getAllQuestionBankLevelEnumValues,
  getQuestionBankLevelName,
} from '../../interfaces';

/**
 * Recitation options (level / count / allow-empty-answer) shown from the
 * Exercises menu. `OK` returns a `ChineseReciteOption`; Cancel / backdrop /
 * Esc return `undefined`. The count is disabled when the table has an
 * explicit selection (its size dictates the queue).
 */
@Component({
  selector: 'app-chinese-exercises-options-dlg',
  templateUrl: 'chinese-exercises-options-dialog.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChineseExercisesOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChineseExercisesOptionsDialogComponent>);
  // Declared BEFORE `countOfItems` because field initializers run in
  // declaration order — `countOfItems`' initializer reads `this.data`.
  readonly data = inject<{
    reciteContentCount: number;
    disableCount: boolean;
    translationDisabled: boolean;
  }>(MAT_DIALOG_DATA);
  readonly selectedLevel = model(QuestionBankItemLevelEnum.Medium);
  readonly allowEmptyAnswer = model(false);
  readonly countOfItems = model(this.data.disableCount ? this.data.reciteContentCount : 20);
  readonly allLevels = getAllQuestionBankLevelEnumValues();
  getQuestionBankLevelName = getQuestionBankLevelName;

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const selvl = this.selectedLevel();

    const closedata: ChineseReciteOption = {
      selectedLevel: selvl,
      countOfItems: this.countOfItems(),
      allowEmptyAnswer: this.allowEmptyAnswer(),
    };

    this.dialogRef.close(closedata);
  }
}
