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
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

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
    elementDiffContainer!: ElementRef;
    @ViewChild('diffcontainer', { static: false }) set content(content: ElementRef) {
        if (content) {
          // initially setter gets called with undefined
          this.elementDiffContainer = content;
          // this.itemForm.nativeElement.focus();
        }
    }
    diffEditor?: any;

    // get oldModel(): NuMonacoEditorDiffModel {
    //     return {
    //         code: this.sents[this.currentIdx].sentence,
    //         language: 'text/plain'
    //     };
    // }
    // get newModel(): NuMonacoEditorDiffModel {
    //     return {
    //         code: this.inputs[this.currentIdx].inputted,
    //         language: 'text/plain'
    //     };
    // }

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
        if (!this.testingMode && this.diffEditor !== undefined) {
            let originalModel = monaco.editor.createModel(
                this.sents[this.currentIdx].sentence,
                "text/plain"
            );
            var modifiedModel = monaco.editor.createModel(
                this.inputs[this.currentIdx].inputted,
                "text/plain"
            );
            
            this.diffEditor.setModel({
                original: originalModel,
                modified: modifiedModel,
            });
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    onSubmit(): void {
        if (this.diffEditor === undefined) {
            this.diffEditor = monaco.editor.createDiffEditor(
                this.elementDiffContainer.nativeElement,
                {
                    // You can optionally disable the resizing
                    enableSplitViewResizing: false,
                }
            );
        }

        this.testingMode = false;
    }
}
