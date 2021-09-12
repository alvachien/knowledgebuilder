import { Component, OnInit } from '@angular/core';
import { KatexOptions } from 'ngx-markdown';

import { KnowledgeItem, Tag, ExerciseItem, TagReferenceType, ExerciseItemType, getExerciseItemTypeName, } from 'src/app/models';
import { ODataService, PreviewObject } from 'src/app/services';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  previewIdx: number;
  selectedKnowledge: KnowledgeItem | undefined;
  selectedExercise: ExerciseItem | undefined;
  listPreviewObjects: PreviewObject[] = [];
  selectedObj: PreviewObject | undefined;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };
  hideAnswer = false; // Hide the answer

  constructor(private odataSvc: ODataService) {
    this.previewIdx = -1;
  }

  getExerciseItemTypeName(reftype: ExerciseItemType): string {
    return getExerciseItemTypeName(reftype);
  }

  ngOnInit(): void {
    this.listPreviewObjects = this.odataSvc.previewObjList.slice();
    this.odataSvc.previewObjList = [];

    if (this.listPreviewObjects.length > 0) {
      this.previewIdx = -1;
      this.onNextPreviewItem();
    }
  }

  public onPreviousPreviewItem(): void {
    // Previous preview item
    if (this.previewIdx > 0) {
      this.previewIdx --;
      this.selectedObj = this.listPreviewObjects[this.previewIdx];

      this.fetchPreviewItem();
    }
  }
  public onNextPreviewItem(): void {
    // Next preview item
    if (this.previewIdx < this.listPreviewObjects.length) {
      this.previewIdx ++;
      this.selectedObj = this.listPreviewObjects[this.previewIdx];

      this.fetchPreviewItem();
    }
  }
  get isNextPreviewButtonEnabled(): boolean {
    return this.previewIdx < this.listPreviewObjects.length - 1;
  }
  get isPreviousButtonEnabled(): boolean {
    return this.previewIdx > 0;
  }
  public fetchPreviewItem() {
    if (this.previewIdx > -1 && this.previewIdx < this.listPreviewObjects.length ) {
      if (this.selectedObj?.refType === TagReferenceType.KnowledgeItem) {
        this.odataSvc.readKnowledgeItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({
          next: val => {
            this.selectedKnowledge = val;
          },
          error: err => {
            console.error(err);
          }
        });
      } else if (this.selectedObj?.refType === TagReferenceType.ExerciseItem) {
        this.odataSvc.readExerciseItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({
          next: val => {
            this.selectedExercise = val;
          },
          error: err => {
            console.error(err);
          }
        });
      }
    }
  }
}
