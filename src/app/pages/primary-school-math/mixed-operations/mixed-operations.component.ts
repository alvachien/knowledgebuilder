import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { MixedOperationQuizItem, PrimarySchoolMathQuizSection, QuizSection } from 'src/app/models';
import { CanComponentDeactivate, CanDeactivateGuard, QuizService } from 'src/app/services';

@Component({
  selector: 'app-primary-school-math-mixed-op',
  templateUrl: './mixed-operations.component.html',
  styleUrls: ['./mixed-operations.component.scss'],
})
export class MixedOperationsComponent implements OnInit, OnDestroy, CanDeactivateGuard {
  isQuizStarted = false;
  quizControlFormGroup: FormGroup = new FormGroup({
    countControl: new FormControl(20, [Validators.required, Validators.min(1), Validators.max(1000)]),
    failedFactorControl: new FormControl(2, [Validators.min(0), Validators.max(10)]),
    leftSummandControl: new FormControl(0),
    rightSummandControl: new FormControl(100),
    leftAddendControl: new FormControl(0),
    rightAddendControl: new FormControl(100),
    negControl: new FormControl(false),
    decControl: new FormControl(0, [Validators.min(0), Validators.max(5)]),
  }, { validators: this.basicValidator });
  QuizItems: MixedOperationQuizItem[] = [];
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
  inputCtrl!: ElementRef;
  @ViewChild('irst', {static: false}) set inputControl(content: ElementRef) {
    if (content) {
      this.inputCtrl = content;
      this.inputCtrl.nativeElement.focus();
    }
  }
  @ViewChild('opers', {static: false}) operatorsCtrl?: MatSelectionList;
  quizSections: PrimarySchoolMathQuizSection[] = [];
  allowedOperators: any[] = [
    { display: ' + ', value: '+' },
    { display: ' - ', value: '-' },
    { display: ' × ', value: '*' },
    { display: ' ÷ ', value: '/' },
  ];

  constructor(private quizService: QuizService,
    public snackBar: MatSnackBar,
    private router: Router,
    private changeDef: ChangeDetectorRef) {
  }

  canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> | Promise<boolean> {
    return !this.isQuizStarted;
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }

  canStart(): boolean {
    return !this.isQuizStarted && this.quizControlFormGroup.valid
      && this.operatorsCtrl! && this.operatorsCtrl!.selectedOptions.selected.length > 0;
  }

  onQuizStart(): void {
    if (!this.quizService.ActiveQuiz) {
      let quiz = this.quizService.startNewQuiz(this.quizService.NextQuizID);
      this.generateQuizSection(this.quizControlFormGroup.get('countControl')!.value);
      let quizSection = new QuizSection(quiz.NextSectionID, this.QuizItems.length);
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
        let failedfactor = this.quizControlFormGroup.get('failedFactorControl')!.value;

        if (failedItems.length > 0 && failedfactor > 0) {
          this.snackBar.open(`Failed items: ${failedItems.length}, please retry`, undefined, {
            duration: 2000,
          });

          this.generateQuizSection(failedItems.length * failedfactor);
          this.QuizCursor = 0;
          this.setNextButtonText();

          let curquiz = this.quizService.ActiveQuiz!;
          let quizSection = new QuizSection(curquiz.NextSectionID, this.QuizItems.length);
          curquiz.startNewSection(quizSection);
        } else {
          this.isQuizStarted = false;
          // this.changeDef.detectChanges();

          let qid = this.quizService.ActiveQuiz?.QuizID;
          this.quizService.completeActiveQuiz();

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

  private generateQuizItem(idx: number): MixedOperationQuizItem {
    const allowneg: boolean = this.quizControlFormGroup.get('negControl')!.value as boolean;
    let qz: MixedOperationQuizItem;
    while (true) {
      let fmt = this.getNumber().toString();

      this.operatorsCtrl!.selectedOptions.selected.forEach(vop => {
        fmt += vop.value;
        fmt += this.getNumber().toString();
      });
      qz = new MixedOperationQuizItem(fmt);
      if (!allowneg && qz.Result < 0) {
        continue;
      }
      qz.QuizIndex = idx;
      break;
    }

    return qz;
  }
  private getNumber(): number {
    let mfactor = 0;
    const decplace = this.quizControlFormGroup.get('decControl')!.value;
    mfactor = Math.pow(10, decplace);
    const leftNumb = mfactor * this.quizControlFormGroup.get('leftSummandControl')!.value;
    const rightNumb = mfactor * this.quizControlFormGroup.get('rightSummandControl')!.value;

    let rnum1 = Math.round(Math.random() * ( rightNumb - leftNumb )) + leftNumb;
    if (mfactor !== 0) {
      rnum1 = rnum1 / mfactor;
    }
    return rnum1;
  }
  private generateQuizSection(itemcnt: number): void {
    this.QuizItems = [];

    for (let i = 0; i < itemcnt; i++) {
      const dq: MixedOperationQuizItem = this.generateQuizItem(i + 1);

      this.QuizItems.push(dq);
    }
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
