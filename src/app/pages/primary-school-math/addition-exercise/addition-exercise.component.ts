import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';

import { AdditionQuizItem } from 'src/app/models';
import { QuizService } from 'src/app/services';

@Component({
  selector: 'app-primary-school-math-addex',
  templateUrl: './addition-exercise.component.html',
  styleUrls: ['./addition-exercise.component.scss'],
})
export class AdditionExerciseComponent implements OnInit, OnDestroy {
  isQuizStarted = false;
  quizControlFormGroup: FormGroup = new FormGroup({
    countControl: new FormControl(50, [Validators.required, Validators.min(1), Validators.max(1000)]),
    failedFactorControl: new FormControl(5, [Validators.min(0), Validators.max(10)]),
    leftSummandControl: new FormControl(0),
    rightSummandControl: new FormControl(100),
    leftAddendControl: new FormControl(0),
    rightAddendControl: new FormControl(100)
  }, { validators: this.basicValidator });
  QuizItems: AdditionQuizItem[] = [];
  UsedQuizAmount = 0;
  QuizCursor = 0;
  quizFormGroup: FormGroup = new FormGroup({
    inputControl: new FormControl(null, Validators.required)
  });
  itemForm!: ElementRef;
  NextButtonText = 'Common.Next';
  @ViewChild('itemForm', { static: false }) set content(content: ElementRef) {
    if (content) { // initially setter gets called with undefined
      this.itemForm = content;
      this.itemForm.nativeElement.focus();
    }
  }

  constructor(private quizService: QuizService) {
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
  }

  canStart(): boolean {
    return !this.isQuizStarted && this.quizControlFormGroup.valid;
  }

  onQuizStart(): void {
    this.isQuizStarted = true;
    this.generateQuizSection();

    this.setNextButtonText();
  }

  onQuizSubmit(): void {
    if (this.QuizItems[this.QuizCursor].InputtedResult === undefined) {
    } else {
      if (this.QuizCursor === this.UsedQuizAmount - 1) {
        // do real submit
        const failedItems = [];
        for (const quiz of this.QuizItems) {
          if (!quiz.IsCorrect()) {
            failedItems.push(quiz);
          }
        }
        if (failedItems.length > 0) {
          alert(" succeed.");
        } else {
          alert(" succeed.");
        }
      } else {
        this.QuizCursor ++;
        this.setNextButtonText();
      }
    }
  }
  onPrevious(): void {
    this.QuizCursor --;
    this.setNextButtonText();
  }
  get isSubmitButtonDisabled(): boolean {
    return this.QuizCursor >= this.UsedQuizAmount;
  }
  get isPreviousButtonDisabled(): boolean {
    return this.QuizCursor <= 0;
  }
  setNextButtonText(): void {
    if (this.QuizCursor === this.UsedQuizAmount - 1) {
      this.NextButtonText = 'Common.Submit';
    }
  }

  private generateQuizItem(idx: number): AdditionQuizItem {
    const rnum1 = Math.random() *
      (this.quizControlFormGroup.get('rightSummandControl')!.value - this.quizControlFormGroup.get('leftSummandControl')!.value)
      + this.quizControlFormGroup.get('leftSummandControl')!.value;
    const rnum2 = Math.random() *
      (this.quizControlFormGroup.get('rightAddendControl')!.value - this.quizControlFormGroup.get('leftAddendControl')!.value)
      + this.quizControlFormGroup.get('leftAddendControl')!.value;
    const qz: AdditionQuizItem = new AdditionQuizItem(rnum1, rnum2, 0); // TBD
    qz.QuizIndex = idx;
    return qz;
  }
  private generateQuizSection(): void {
    this.QuizItems = [];

    for (let i = 0; i < this.quizControlFormGroup.get('countControl')!.value; i++) {
      const dq: AdditionQuizItem = this.generateQuizItem(this.UsedQuizAmount + i + 1);

      this.QuizItems.push(dq);
    }
    this.UsedQuizAmount += this.QuizItems.length;
  }

  // ValidatorFn
  basicValidator(control: AbstractControl): ValidationErrors | null {
    // Summand
    const leftSummard = control.get('leftSummandControl');
    const rightSummard = control.get('rightSummandControl');
    // Addend
    const leftAddend = control.get('leftAddendControl');
    const rightAddend = control.get('rightAddendControl');

    let isvalid = false;
    if (leftSummard && rightSummard && leftAddend && rightAddend
        && leftSummard.value < rightSummard.value
        && leftAddend.value < rightAddend.value) {
      isvalid = true;
    }

    return isvalid ? null : { invalidInputs: true };
  }
}

