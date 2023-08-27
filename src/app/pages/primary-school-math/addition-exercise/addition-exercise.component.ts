import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AdditionQuizItem, PrimarySchoolMathQuizSection, QuizSection } from 'src/app/models';
import { CanComponentDeactivate, CanDeactivateGuard, QuizService } from 'src/app/services';
import { QuizFailureDailogComponent } from '../../quiz-failure-dailog';

@Component({
  selector: 'khb-primary-school-math-addex',
  templateUrl: './addition-exercise.component.html',
  styleUrls: ['./addition-exercise.component.scss'],
})
export class AdditionExerciseComponent implements CanDeactivateGuard {
  isQuizStarted = false;
  quizControlFormGroup: UntypedFormGroup = new UntypedFormGroup(
    {
      countControl: new UntypedFormControl(20, [Validators.required, Validators.min(1), Validators.max(1000)]),
      failedFactorControl: new UntypedFormControl(2, [Validators.min(0), Validators.max(10)]),
      leftNumberControl: new UntypedFormControl(0),
      rightNumberControl: new UntypedFormControl(100),
      decControl: new UntypedFormControl(0, [Validators.min(0), Validators.max(5)]),
    },
    { validators: this.basicValidator }
  );
  QuizItems: AdditionQuizItem[] = [];
  QuizCursor = 0;
  quizFormGroup: UntypedFormGroup = new UntypedFormGroup({
    inputControl: new UntypedFormControl(null, Validators.required),
  });
  itemForm!: ElementRef;
  NextButtonText = 'Common.Next';
  @ViewChild('itemForm', { static: false }) set content(content: ElementRef) {
    if (content) {
      // initially setter gets called with undefined
      this.itemForm = content;
      this.itemForm.nativeElement.focus();
    }
  }
  inputCtrl!: ElementRef;
  @ViewChild('irst', { static: false }) set inputControl(content: ElementRef) {
    if (content) {
      this.inputCtrl = content;
      this.inputCtrl.nativeElement.focus();
    }
  }
  quizSections: PrimarySchoolMathQuizSection[] = [];

  constructor(
    private quizService: QuizService,
    public snackBar: MatSnackBar,
    private router: Router,
    private changeDef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> | Promise<boolean> {
    return !this.isQuizStarted;
  }

  canStart(): boolean {
    return !this.isQuizStarted && this.quizControlFormGroup.valid;
  }

  onQuizStart(): void {
    if (!this.quizService.ActiveQuiz) {
      const quiz = this.quizService.startNewQuiz(this.quizService.NextQuizID);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.generateQuizSection(this.quizControlFormGroup.get('countControl')!.value);
      const quizSection = new QuizSection(quiz.NextSectionID, this.QuizItems.length);
      quiz.startNewSection(quizSection);

      this.isQuizStarted = true;
      this.changeDef.detectChanges();

      this.setNextButtonText();
    }
  }

  onQuizSubmit(): void {
    if (this.QuizItems[this.QuizCursor].InputtedResult === undefined) {
      if (this.inputCtrl) {
        this.inputCtrl.nativeElement.focus();
      }
    } else {
      if (this.QuizCursor === this.QuizItems.length - 1) {
        // do real submit
        const failedItems = [];
        for (const quiz of this.QuizItems) {
          if (!quiz.IsCorrect()) {
            failedItems.push(quiz);
          }
        }

        // Complete current section, and start another one!
        this.quizService.ActiveQuiz?.completeActionSection(failedItems.length);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const failedfactor = this.quizControlFormGroup.get('failedFactorControl')!.value;

        if (failedItems.length > 0 && failedfactor > 0) {
          this.quizService.FailedQuizItems = failedItems;
          this.quizService.CurrentScore = (this.QuizItems.length - failedItems.length) / this.QuizItems.length;
          const dialogRef = this.dialog.open(QuizFailureDailogComponent, {
            disableClose: false,
            width: '500px',
          });

          dialogRef.afterClosed().subscribe(() => {
            this.generateQuizSection(failedItems.length * failedfactor);
            this.QuizCursor = 0;
            this.setNextButtonText();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const curquiz = this.quizService.ActiveQuiz!;
            const quizSection = new QuizSection(curquiz.NextSectionID, this.QuizItems.length);
            curquiz.startNewSection(quizSection);
          });
          // this.snackBar.open(`Failed items: ${failedItems.length}, please retry`, undefined, {
          //   duration: 2000,
          // });
        } else {
          const qid = this.quizService.ActiveQuiz?.QuizID;
          this.quizService.completeActiveQuiz();
          this.isQuizStarted = false;

          this.router.navigate(['/quiz-summary/display', qid]);
        }
      } else {
        this.QuizCursor++;
        this.setNextButtonText();
        if (this.inputCtrl) {
          this.inputCtrl.nativeElement.focus();
        }
      }
    }
  }
  onPrevious(): void {
    this.QuizCursor--;
    this.setNextButtonText();
    if (this.inputCtrl) {
      this.inputCtrl.nativeElement.focus();
    }
  }
  get isSubmitButtonDisabled(): boolean {
    return this.QuizCursor > this.QuizItems.length;
  }
  get isPreviousButtonDisabled(): boolean {
    return this.QuizCursor <= 0;
  }
  setNextButtonText(): void {
    if (this.QuizCursor === this.QuizItems.length - 1) {
      this.NextButtonText = 'Common.Submit';
    }
  }

  private getNumber(): number {
    let mfactor = 0;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decplace = this.quizControlFormGroup.get('decControl')!.value;
    mfactor = Math.pow(10, decplace);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const leftNumb = mfactor * this.quizControlFormGroup.get('leftNumberControl')!.value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rightNumb = mfactor * this.quizControlFormGroup.get('rightNumberControl')!.value;

    let rnum1 = Math.round(Math.random() * (rightNumb - leftNumb)) + leftNumb;
    if (mfactor !== 0) {
      rnum1 = rnum1 / mfactor;
    }
    return rnum1;
  }
  private generateQuizItem(idx: number): AdditionQuizItem {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decplace = this.quizControlFormGroup.get('decControl')!.value;
    const qz: AdditionQuizItem = new AdditionQuizItem(this.getNumber(), this.getNumber(), decplace);
    qz.QuizIndex = idx;
    return qz;
  }
  private generateQuizSection(itemcnt: number): void {
    this.QuizItems = [];

    for (let i = 0; i < itemcnt; i++) {
      const dq: AdditionQuizItem = this.generateQuizItem(i + 1);

      this.QuizItems.push(dq);
    }
  }

  // ValidatorFn
  basicValidator(control: AbstractControl): ValidationErrors | null {
    const lowNumber = control.get('leftNumberControl');
    const highNumber = control.get('rightNumberControl');

    let isvalid = false;
    if (lowNumber && highNumber && lowNumber.value < highNumber.value) {
      isvalid = true;
    }

    return isvalid ? null : { invalidInputs: true };
  }
}
