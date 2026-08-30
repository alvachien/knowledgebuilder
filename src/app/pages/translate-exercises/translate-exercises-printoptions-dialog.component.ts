import { Component, Inject, inject, model } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type { TranslateExercisePrintOption } from '../../interfaces';
import {
  TranslateDirectionEnum,
  MY_DATE_FORMATS,
  getAllPrintExecDateString,
} from '../../interfaces';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

@Component({
  selector: 'app-translate-exercises-printoptions-dlg',
  templateUrl: './translate-exercises-printoptions-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatSelectModule,
    MatDialogActions,
    MatDatepickerModule,
    MatDateFnsModule,
    TranslocoModule,
  ],
  providers: [
    provideDateFnsAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: zhCN },
  ],
})
export class TranslateExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesPrintOptionsDialogComponent>);
  readonly transloco = inject(TranslocoService);

  readonly allDirections = [
    { value: TranslateDirectionEnum.ChineseToEnglish },
    { value: TranslateDirectionEnum.EnglishToChinese },
  ];

  readonly countOfItems = model(this.data.withSelection ? this.data.reciteQueuesCount : 20);
  readonly printAnswer = model(false);
  readonly printWord = model(false);
  readonly direction = model(TranslateDirectionEnum.EnglishToChinese);
  readonly printEntryDate = model(true);
  readonly selectedExecDateModel = model<number>(0);
  readonly execDate = model(new Date());

  readonly allPrintExecDates = getAllPrintExecDateString();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reciteQueuesCount: number;
      withSelection: boolean;
    }
  ) {}

  getDirectionName(dir: TranslateDirectionEnum): string {
    switch (dir) {
      case TranslateDirectionEnum.ChineseToEnglish:
        return this.transloco.translate('translateExercises.chineseToEnglish');
      default:
        return this.transloco.translate('translateExercises.englishToChinese');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const closedata: TranslateExercisePrintOption = {
      printAnswer: this.printAnswer(),
      printWord: this.printWord(),
      countOfItems: this.countOfItems(),
      direction: this.direction(),
      printEntryDate: this.printEntryDate(),
      respectRetentionCurve: this.selectedExecDateModel() === 1 ? true : false,
      printExecDate: this.selectedExecDateModel() === 2 ? true : false,
      execDate: this.selectedExecDateModel() === 2 ? this.execDate() : undefined,
    };

    this.dialogRef.close(closedata);
  }
}
