import { Component, Inject, inject, model, ChangeDetectionStrategy } from '@angular/core';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import type { TranslateExerciseOption } from '../../interfaces';
import { TranslateDirectionEnum } from '../../interfaces';

@Component({
  selector: 'app-translate-exercises-options-dlg',
  templateUrl: './translate-exercises-options-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogTitle,
    MatSelectModule,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
})
export class TranslateExercisesOptionsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesOptionsDialogComponent>);
  readonly transloco = inject(TranslocoService);

  readonly allDirections = [
    { value: TranslateDirectionEnum.ChineseToEnglish },
    { value: TranslateDirectionEnum.EnglishToChinese },
  ];

  // Reopening shows the last picks (currentSettings); with an active table
  // selection the count is pinned to the selection size.
  readonly countOfItems = model(
    this.data.withSelection
      ? this.data.reciteQueuesCount
      : (this.data.currentSettings?.countOfItems ?? 20)
  );
  readonly direction = model(
    this.data.currentSettings?.direction ?? TranslateDirectionEnum.EnglishToChinese
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reciteQueuesCount: number;
      withSelection: boolean;
      currentSettings?: TranslateExerciseOption;
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
    const closedata: TranslateExerciseOption = {
      countOfItems: this.countOfItems(),
      direction: this.direction(),
    };

    this.dialogRef.close(closedata);
  }
}
