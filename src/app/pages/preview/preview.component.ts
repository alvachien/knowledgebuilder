import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { KatexOptions } from 'ngx-markdown';

import {
  KnowledgeItem,
  ExerciseItem,
  TagReferenceType,
  ExerciseItemType,
  getExerciseItemTypeName,
  ExerciseItemUserScore,
} from 'src/app/models';
import { ODataService, PreviewObject, UIUtilityService } from 'src/app/services';
import { PreviewNewScoreSheet } from './preview-newscore-sheet';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnDestroy {
  previewIdx: number;
  selectedKnowledge: KnowledgeItem | undefined;
  selectedExercise: ExerciseItem | undefined;
  selectedExerciseUserScore: ExerciseItemUserScore | null = null;
  listPreviewObjects: PreviewObject[] = [];
  selectedObj: PreviewObject | undefined;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };
  focusMode = false; // Focus mode
  hideAnswer = false; // Hide the answer
  fontSize = 20;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    private odataSvc: ODataService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _bottomSheet: MatBottomSheet,
    private uiUtilSrv: UIUtilityService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.previewIdx = -1;
  }

  getExerciseItemTypeName(reftype: ExerciseItemType): string {
    return getExerciseItemTypeName(reftype);
  }
  get isSuccessScore(): boolean {
    if (this.selectedExerciseUserScore !== null && this.selectedExerciseUserScore.Score >= 60) return true;
    return false;
  }

  ngOnInit(): void {
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.listPreviewObjects = this.uiUtilSrv.previewObjList.slice();
    this.uiUtilSrv.previewObjList = [];

    if (this.listPreviewObjects.length > 0) {
      this.previewIdx = -1;
      this.onNextPreviewItem();
    }
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  public onPreviousPreviewItem(): void {
    // Previous preview item
    if (this.previewIdx > 0) {
      this.previewIdx--;
      this.selectedObj = this.listPreviewObjects[this.previewIdx];

      this.fetchPreviewItem();
    }
  }
  public onNextPreviewItem(): void {
    // Next preview item
    if (this.previewIdx < this.listPreviewObjects.length) {
      this.previewIdx++;
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
    if (this.previewIdx > -1 && this.previewIdx < this.listPreviewObjects.length) {
      if (this.selectedObj?.refType === TagReferenceType.KnowledgeItem) {
        this.odataSvc.readKnowledgeItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({
          next: (val) => {
            this.selectedKnowledge = val;
          },
          error: (err) => {
            this.uiUtilSrv.showSnackInfo(err);
          },
        });
      } else if (this.selectedObj?.refType === TagReferenceType.ExerciseItem) {
        this.odataSvc.readExerciseItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({
          next: (val) => {
            this.selectedExercise = val;
          },
          error: (err) => {
            this.uiUtilSrv.showSnackInfo(err);
          },
        });
        this.odataSvc.getLastestExerciseItemUserScore(this.listPreviewObjects[this.previewIdx].refId).subscribe({
          next: (val) => {
            this.selectedExerciseUserScore = val;
          },
          error: (err) => {
            this.uiUtilSrv.showSnackInfo(err);
          },
        });
      }
    }
  }
  public onNewScore() {
    const rst = this._bottomSheet.open(PreviewNewScoreSheet, {
      data: {
        excitemid: this.selectedExercise?.ID,
      },
    });

    rst.afterDismissed().subscribe((val) => {
      if (val.resultFlag) {
        if (val.newScore) {
          this.selectedExerciseUserScore = val.newScore;
        }
      } else {
        this.uiUtilSrv.showSnackInfo(val.errorInfo);
      }
    });
  }
}
