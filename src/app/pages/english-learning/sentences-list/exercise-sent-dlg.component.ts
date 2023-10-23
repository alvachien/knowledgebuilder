import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { EnglishSentence } from "src/app/models";
import { EnglishLearningService } from "src/app/services";
import { NuMonacoEditorDiffModel, NuMonacoEditorModule } from '@ng-util/monaco-editor';

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
        NuMonacoEditorModule,
    ],
})
export class ExerciseSentenceDialog {
    score = 0;
    currentIdx = 0;
    sents: EnglishSentence[] = [];
    inputs: EnglishSentenceExerciseResult[] = [];
    testingMode = true;
    editorOptions = { theme: 'vs', renderSideBySide: false, };

    originalModel: NuMonacoEditorDiffModel = { code: ''};
    modifiedModel: NuMonacoEditorDiffModel = { code: ''};

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
        if (!this.testingMode) {
            this.originalModel = {
                code: this.sents[this.currentIdx].sentence,
                language: "text/plain"
            };
            this.modifiedModel = {
                code: this.inputs[this.currentIdx].inputted,
                language: "text/plain"
            };
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    onSubmit(): void {
        setTimeout(() => {
            this.testingMode = false;
            this.currentIdx = 0;
            this.originalModel = {
                code: this.sents[this.currentIdx].sentence,
                language: "text/plain"
            };
            this.modifiedModel = {
                code: this.inputs[this.currentIdx].inputted,
                language: "text/plain"
            };
        }, 1000);
    }
}
