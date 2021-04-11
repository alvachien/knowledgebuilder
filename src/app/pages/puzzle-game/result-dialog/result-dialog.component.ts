import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ResultDialogData {
  youWin: boolean,
  haveAnotherTry: boolean;
}

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styleUrls: ['./result-dialog.component.scss'],
})
export class ResultDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResultDialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
