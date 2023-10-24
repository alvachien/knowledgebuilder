import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

export interface DictationSettingDlgData {
    numOfExercise: number;
}

@Component({
    selector: 'khb-englrn-dict-sett-dlg',
    templateUrl: 'dictation-setting-dlg.component.html',
})
export class DictationSettingDialog {

    constructor(
        public dialogRef: MatDialogRef<DictationSettingDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DictationSettingDlgData,
    ) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
