import { Component, Input, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxPrintModule } from 'ngx-print';

import type { QuestionBankTypeKeys } from '../../interfaces';
import type { KnowledgeExercisePrintOption, QuestionBankItemBase } from '../../interfaces/questionbank-base';
import { KnowledgeExerciseItemComponent } from '../knowledge-exercise-item/knowledge-exercise-item.component';

@Component({
  selector: 'app-knowledge-exercise-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KnowledgeExerciseItemComponent,
    MatFormFieldModule,
    MatButtonModule,
    NgxPrintModule
  ],
  templateUrl: './knowledge-exercise-form.component.html',
  styleUrl: './knowledge-exercise-form.component.scss',
})
export class KnowledgeExerciseFormComponent {
  private _questions: QuestionBankItemBase<string>[] | null = [];
  printMode = input.required<boolean>();
  printSetting = input<KnowledgeExercisePrintOption>();
  printID = new Date().toISOString();

  get printFormTitle(): string {
    const setting = this.printSetting();
    return (setting && setting.formTitle) || 'Knowledge Exercise Form';
  }
  get printEntryDate(): boolean {
    const setting = this.printSetting();
    return (setting && setting.printEntryDate) || false;
  }
  get printScore(): boolean {
    const setting = this.printSetting();
    return (setting && setting.printScore) || false;
  }
  get printAnswer(): boolean {
    const setting = this.printSetting();
    return (setting && setting.printAnswer) || false;
  }
  get hideLabelOfQuestionType(): QuestionBankTypeKeys[] {
    const setting = this.printSetting();
    return (setting && setting.hideLabelOfQuestionType) || [];
  }

  @Input()
  set questions(qns: QuestionBankItemBase<string>[] | null) {
    this._questions = qns;

    const totalgrp = {};
    if (this._questions && this._questions.length > 0) {
      this._questions.forEach((qtn) => {
        const grp = qtn.getFormControls();
        Object.assign(totalgrp, grp);
      })
    }
    this.form = new FormGroup(totalgrp);
  }

  get questions(): QuestionBankItemBase<string>[] | null {
    return this._questions;
  }

  getQuestionAnswer(question: QuestionBankItemBase<string>): string[] | undefined {
    return question.getAnswers();
  }

  form?: FormGroup;
  payLoad = '';

  onSubmit() {
    this.payLoad = JSON.stringify(this.form?.getRawValue());
  }
}
