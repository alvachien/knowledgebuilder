import type { AfterViewInit, ElementRef} from '@angular/core';
import { Component, Input, input, ViewChild } from '@angular/core';
import type { FormGroup} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';

import type { QuestionBankTypeKeys, ValidOptionKeys } from '../../interfaces';
import { getQuestionBankLevelName, QuestionBankTypeEnum, VALID_OPTION_KEYS } from '../../interfaces';
import type {
  QuestionBankItemBase, QuestionBankItemCloze, QuestionBankItemDictation, QuestionBankItemEssay, QuestionBankItemFillInTheBlank,
  QuestionBankItemFillInTheBlankParagraph, QuestionBankItemListeningComprehension, QuestionBankItemMultipleChoice, QuestionBankItemReadingComprehension, 
  QuestionBankItemShortAnswer, QuestionBankItemSingleChoice,
  QuestionBankItemTrueFalse
} from '../../interfaces/questionbank-base';

import 'katex/contrib/auto-render';

// 为TypeScript声明renderMathInElement函数
declare function renderMathInElement(
  element: HTMLElement,
  options?: any
): void;

@Component({
  selector: 'app-knowledge-exercise-item',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    TranslocoModule,
  ],
  templateUrl: './knowledge-exercise-item.component.html',
  styleUrl: './knowledge-exercise-item.component.scss',
})
export class KnowledgeExerciseItemComponent implements AfterViewInit {
  // question = input.required<QuestionBankItemBase<string>>();
  form = input<FormGroup>();
  printMode = input.required<boolean>();
  @ViewChild('exercise_item_container') fromItemContainer!: ElementRef;

  // UI fields
  questionid: string = '';
  questionOrder: number = 1;
  // Fill in the blank
  paragraphes: QuestionBankItemFillInTheBlankParagraph[] = [];
  // Query string
  questionString: string = '';
  // Reading comprehension
  questionLines: string[] = [];
  options: { key: string; value: string }[] = [];
  // Line of answers
  rowsOfAnswers = 1;
  // Reference ID
  refToID?: string = undefined;

  // Question
  private _question: QuestionBankItemBase<string> | undefined;
  get questionTypeName(): string {
    return this._question?.getItemTypeDescription() ?? '';
  }
  private _questionLevelName: string = '';
  get dictationLevelName(): string {
    return this._questionLevelName;
  }
  private _dictationCountOfInputs: number = 0;
  get dictationCountOfInputs(): number {
    return this._dictationCountOfInputs;
  }

  @Input()
  set question(qtn: QuestionBankItemBase<string> | undefined) {
    this._question = qtn;
    this.questionid = this._question?.id || '';
    this.questionOrder = this._question?.order || 1;
    // Reset accumulators to prevent stale data when component is reused
    this.options = [];
    this.paragraphes = [];
    this.questionString = '';
    this.questionLines = [];

    switch (this._question?.itemType) {
      case QuestionBankTypeEnum.FillInTheBlank: {
        const fibitem = this._question as QuestionBankItemFillInTheBlank;
        this.paragraphes = [];
        this.paragraphes = fibitem.paragraphes;
        this.refToID = fibitem.referToID;
        break;
      }

      case QuestionBankTypeEnum.SingleChoice: {
        const scitem = this._question as QuestionBankItemSingleChoice;
        this.questionString = scitem.question;
        this.refToID = scitem.referToID;
        (Object.keys(VALID_OPTION_KEYS) as ValidOptionKeys[]).forEach((key) => {
          if (scitem.options && scitem.options[key] !== undefined) { // Check option exists
            this.options.push({ key: key.toString(), value: scitem.options[key] });
          }
        });
        break;
      }

      case QuestionBankTypeEnum.MultipleChoice: {
        const scitem = this._question as QuestionBankItemMultipleChoice;
        this.refToID = scitem.referToID;
        this.questionString = scitem.question;
        (Object.keys(VALID_OPTION_KEYS) as ValidOptionKeys[]).forEach((key) => {
          if (scitem.options && scitem.options[key] !== undefined) { // Check option exists
            this.options.push({ key: key.toString(), value: scitem.options[key] });
          }
        });
        break;
      }

      case QuestionBankTypeEnum.Dictation: {
        const dictitem = this._question as QuestionBankItemDictation;
        this.questionString = dictitem.question;
        this.paragraphes = [];
        this.paragraphes = dictitem.paragraphes;
        this._questionLevelName = getQuestionBankLevelName(dictitem.questionLevel);
        this._dictationCountOfInputs = dictitem.countOfInputs;        
        break;
      }

      case QuestionBankTypeEnum.ShortAnswer: {
        const scitem = this._question as QuestionBankItemShortAnswer;
        this.questionString = scitem.question;
        this.rowsOfAnswers = scitem.rowsOfAnswers || 1;
        this.refToID = scitem.referToID;
        break;
      }

      case QuestionBankTypeEnum.ReadingComprehension: {
        const scitem = this._question as QuestionBankItemReadingComprehension;
        this.questionLines = scitem.question.split('\n');        
        break;
      }

      case QuestionBankTypeEnum.Cloze: {
        const scitem = this._question as QuestionBankItemCloze;
        this.questionLines = scitem.question.split('\n');
        break; 
      }

      case QuestionBankTypeEnum.ListeningComprehension: {
        const scitem = this._question as QuestionBankItemListeningComprehension;
        this.questionLines = scitem.question.split('\n');
        break; 
      }

      case QuestionBankTypeEnum.TrueFalse: {
        const scitem = this._question as QuestionBankItemTrueFalse;
        this.questionString = scitem.question;
        this.refToID = scitem.referToID;
        break; 
      }

      case QuestionBankTypeEnum.Essay: {
        const scitem = this._question as QuestionBankItemEssay;
        this.questionString = scitem.question;
        this.rowsOfAnswers = scitem.rowsOfAnswers || 10;
        this.refToID = scitem.referToID;
        break;
      }

      default: {
        break; 
      }
    }
  }
  get question(): QuestionBankItemBase<string> | undefined { return this._question; }

  @Input() hideLabels: QuestionBankTypeKeys[] = [];
  @Input() isSubItem: boolean = false;

  isLabelOfQuestionTypeHidden(): boolean {
    return !(this.hideLabels && this.hideLabels.includes(this._question?.itemType as QuestionBankTypeKeys));
  }

  getFormControlName(optkey: any) {
    return `${this.questionid}-${optkey.toString()}`;
  }

  ngAfterViewInit(): void {
    // console.log('ngAfterViewInit');
    if (this._question?.isLatexSupported()) {
      this.renderMathInElement(this.fromItemContainer.nativeElement);
    }
  }

  renderMathInElement(element: HTMLElement) {
    renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  }
}
