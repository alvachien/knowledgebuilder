import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

import { MarkdownContentComponent } from '../../shared/markdown-content';

@Component({
  selector: 'app-translate-exercises-info-dlg',
  templateUrl: './translate-exercises-info-dialog.html',
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MarkdownContentComponent,
    TranslocoModule,
  ],
})
export class TranslateExercisesInfoDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesInfoDialogComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      /** i18n key of the dialog title (e.g. translateExercises.explanation). */
      titleKey: string;
      content: string;
    }
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
