import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { TagReferenceType, UserCollection } from 'src/app/models';

@Component({
  selector: 'hkb-exercise-item-addcoll-dlg',
  templateUrl: 'exercise-items-add-coll-dlg.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ExerciseItemAddToCollDialog implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<ExerciseItemAddToCollDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      excitemid: number;
      availableColls: UserCollection[];
      collids: number[];
    }
  ) {}
  @ViewChild('colls') colls!: MatSelectionList;

  ngAfterViewInit() {
    this.colls.selectionChange.subscribe({
      next: () => {
        this.data.collids = [];
        this.colls.selectedOptions.selected.forEach((sel) => {
          this.data.collids.push(+sel.value);
        });
      },
      error: () => {
        // Error handling
      },
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  public isItemExistedInColl(coll: UserCollection): boolean {
    return (
      coll.Items.findIndex(
        (item) => item.RefID === this.data.excitemid && item.RefType === TagReferenceType.ExerciseItem
      ) !== -1
    );
  }
}
