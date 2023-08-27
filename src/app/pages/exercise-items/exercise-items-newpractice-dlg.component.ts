import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'hkb-exercise-item-newscore-dlg',
  templateUrl: 'exercise-items-newpractice-dlg.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ExerciseItemNewPracticeDialog {
  constructor(
    public dialogRef: MatDialogRef<ExerciseItemNewPracticeDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      excitemid: number;
      pracDate: string;
      score?: number;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get isOKDisabled(): boolean {
    if (this.data.score === undefined || this.data.score === null) {
      return true;
    }
    return isNaN(+this.data.score);
  }
}
