import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { zhCN } from 'date-fns/locale';

import type { KnowledgeExercisePrintOption } from '../../../interfaces';
import { MY_DATE_FORMATS, getAllQuestionBankTypes } from '../../../interfaces';

@Component({
  selector: 'app-knowledge-exercises-printoptions-dlg',
  templateUrl: 'knowledge-exercises-printoptions-dlg.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
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
export class KnowledgeExercisesPrintOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<KnowledgeExercisesPrintOptionsDialogComponent>);
  private readonly _snackBar = inject(MatSnackBar);
  readonly transloco = inject(TranslocoService);

  allQuestionBankTypes = getAllQuestionBankTypes();
  readonly formTitle = model('');
  readonly printEntryDate = model(true);
  readonly printScore = model(true);
  readonly printAnswer = model(true);
  readonly printHintOfAnswer = model(false);
  readonly printID = model(true);
  readonly hideLabelOfQuestionType = model([]);
  readonly shuffleOptionsInSelection = model(false);

  constructor() {
    const data = inject<{ defaultTitle: string }>(MAT_DIALOG_DATA);
    this.formTitle.set(data.defaultTitle);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    if (this.formTitle().trim() === '') {
      this._snackBar.open(
        this.transloco.translate('required_field'),
        this.transloco.translate('close'),
        {
          duration: 3000,
        }
      );
      return;
    }

    const closedata: KnowledgeExercisePrintOption = {
      formTitle: this.formTitle(),
      printEntryDate: this.printEntryDate(),
      printScore: this.printScore(),
      printAnswer: this.printAnswer(),
      printHintOfAnswer: this.printHintOfAnswer(),
      printID: this.printID(),
      hideLabelOfQuestionType: this.hideLabelOfQuestionType(),
      shuffleOptionsInSelection: this.shuffleOptionsInSelection(),
    };

    this.dialogRef.close(closedata);
  }
}
