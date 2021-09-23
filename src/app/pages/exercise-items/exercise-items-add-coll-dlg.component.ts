import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TagReferenceType, UserCollection } from 'src/app/models';

@Component({
    selector: 'app-exercise-item-addcoll-dlg',
    templateUrl: 'exercise-items-add-coll-dlg.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ExerciseItemAddToCollDialog {

    constructor(public dialogRef: MatDialogRef<ExerciseItemAddToCollDialog>,
        @Inject(MAT_DIALOG_DATA) public data: {
            excitemid: number;
            availableColls: UserCollection[];
            collid?: number;
        }) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    public isItemExistedInColl(coll: UserCollection): boolean {
        return coll.Items.findIndex(item => item.RefID === this.data.excitemid && item.RefType === TagReferenceType.ExerciseItem) !== -1;
    }
}
