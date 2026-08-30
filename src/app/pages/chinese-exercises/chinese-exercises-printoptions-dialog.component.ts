import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { TranslocoModule } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type { ChineseRecitePrintOption } from '../../interfaces';
import {
  QuestionBankItemLevelEnum,
  MY_DATE_FORMATS,
  getAllPrintExecDateString,
  getAllQuestionBankLevelEnumValues,
  getQuestionBankLevelName,
} from '../../interfaces';

/**
 * Print options (level / count / entry date / answer line break / exec date)
 * shown from the Exercises menu; the print flow itself navigates to the
 * knowledge display page. `OK` returns a `ChineseRecitePrintOption`;
 * Cancel / backdrop / Esc return `undefined`. The count is disabled when the
 * table has an explicit selection (its size dictates the queue).
 */
@Component({
  selector: 'app-chinese-exercises-printoptions-dlg',
  templateUrl: 'chinese-exercises-printoptions-dialog.html',
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
    MatRadioModule,
    MatDatepickerModule,
    MatDateFnsModule,
    TranslocoModule,
  ],
  providers: [
    provideDateFnsAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: zhCN },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChineseExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChineseExercisesPrintOptionsDialogComponent>);
  // Declared BEFORE `countOfItems` because field initializers run in
  // declaration order — `countOfItems`' initializer reads `this.data`.
  readonly data = inject<{
    reciteContentCount: number;
    disableCount: boolean;
    translationDisabled: boolean;
  }>(MAT_DIALOG_DATA);

  readonly selectedLevel = model(QuestionBankItemLevelEnum.Medium);
  readonly countOfItems = model(this.data.disableCount ? this.data.reciteContentCount : 20);
  readonly printEntryDate = model(true);
  readonly answerLineBreak = model(true);
  readonly selectedExecDateModel = model<number>(0);
  readonly execDate = model(new Date());

  readonly allPrintExecDates = getAllPrintExecDateString();
  readonly allLevels = getAllQuestionBankLevelEnumValues();
  getQuestionBankLevelName = getQuestionBankLevelName;

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const selvl = this.selectedLevel();

    const closedata: ChineseRecitePrintOption = {
      selectedLevel: selvl,
      countOfItems: this.countOfItems(),
      printEntryDate: this.printEntryDate(),
      answerLineBreakPerItem: this.answerLineBreak(),
      respectRetentionCurve: this.selectedExecDateModel() === 1 ? true : false,
      printExecDate: this.selectedExecDateModel() === 2 ? true : false,
      execDate: this.selectedExecDateModel() === 2 ? this.execDate() : undefined,
    };

    this.dialogRef.close(closedata);
  }
}
