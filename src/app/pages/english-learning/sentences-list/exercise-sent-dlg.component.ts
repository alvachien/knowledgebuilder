import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { EnglishSentence } from "src/app/models";
import { EnglishLearningService } from "src/app/services";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

export interface EnglishSentenceExerciseDlgData {
    score: number;
}
export interface EnglishSentenceExerciseResult {
    inputted: string;
}

@Component({
    selector: 'khb-englrn-exe-sent-dlg',
    templateUrl: 'exercise-sent-dlg.component.html',
    styleUrls: ['./exercise-sent-dlg.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        NgIf,
        MatDialogModule,
        MatPaginatorModule,
    ],
})
export class ExerciseSentenceDialog {
    score = 0;
    currentIdx = 0;
    sents: EnglishSentence[] = [];
    inputs: EnglishSentenceExerciseResult[] = [];

    constructor(
        public dialogRef: MatDialogRef<ExerciseSentenceDialog>,
        private _srv: EnglishLearningService,
        @Inject(MAT_DIALOG_DATA) public data: EnglishSentenceExerciseDlgData,
    ) {
        this.sents = _srv.englishLearningExerciseSentences;
        this.sents.forEach(sent => {
            this.inputs.push({
                inputted: ''
            });
        });
    }
    handlePageEvent(e: PageEvent) {
        this.currentIdx = e.pageIndex;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
