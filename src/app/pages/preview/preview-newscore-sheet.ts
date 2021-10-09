/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable no-underscore-dangle */
import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ExerciseItemUserScore } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
    selector: 'app-preview-newscore-sheet',
    templateUrl: 'preview-newscore-sheet.html',
})
export class PreviewNewScoreSheet {
    constructor(private _bottomSheetRef: MatBottomSheetRef<PreviewNewScoreSheet>,
        private odataSrv: ODataService,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
            excitemid: number;
            resultFlag: boolean;
            newScore: ExerciseItemUserScore | null;
            errorInfo: string;
        }) {}

    createNewScore(score: number, event: MouseEvent): void {
        event.preventDefault();

        const nscore = new ExerciseItemUserScore();
        nscore.RefID = this.data.excitemid;
        nscore.Score = score;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nscore.User = this.odataSrv.currentUser!.userID;

        this.odataSrv.createExerciseItemUserScore(nscore).subscribe({
            next: val => {
                this.data.resultFlag = true;
                this.data.newScore = val;
                this._bottomSheetRef.dismiss(this.data);
            },
            error: err => {
                this.data.resultFlag = false;
                this.data.newScore = null;
                this.data.errorInfo = err;
                this._bottomSheetRef.dismiss(this.data);
            }
        });
    }
}
