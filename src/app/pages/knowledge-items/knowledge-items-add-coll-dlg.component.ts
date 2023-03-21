import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';

import { TagReferenceType, UserCollection } from 'src/app/models';

@Component({
  selector: 'app-knowledge-item-addcoll-dlg',
  templateUrl: 'knowledge-items-add-coll-dlg.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class KnowledgeItemAddToCollDialog implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<KnowledgeItemAddToCollDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      knowledgeitemid: number;
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
        (item) =>
          item.RefID === this.data.knowledgeitemid &&
          item.RefType === TagReferenceType.KnowledgeItem
      ) !== -1
    );
  }
}
