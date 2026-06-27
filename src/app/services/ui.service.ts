import { Injectable } from '@angular/core';

import type {
  KnowledgeExerciseFileContent,
  KnowledgeExercisePrintOption,
  QuestionBankItemBase,
  QuestionBankItemMultipleChoice,
  QuestionBankItemSingleChoice,
  VALID_OPTION_KEYS,
} from '../interfaces';
import {
  convertToQuestionBankItem,
  QuestionBankTypeEnum,
  shuffleQuestionBankItemOption,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UIService {
  // This service can be used to manage UI-related state or behaviors.

  private _exerciseItems: QuestionBankItemBase<string>[] = [];
  private _includeLatex = false;
  private _exercisePrintSetting?: KnowledgeExercisePrintOption;
  // Base URL for resolving relative image paths within the current exercise content.
  // This is the API directory URL (e.g., "{apiUrl}/api/Storage/knowledge-exercises/")
  // corresponding to the JSON file that the current exercise items were loaded from.
  private _currentExerciseImageBaseUrl?: string;

  // Set selected knowledge exercise item
  setSelectedExerciseItem(
    items: KnowledgeExerciseFileContent[],
    printSetting?: KnowledgeExercisePrintOption,
    includeLatex?: boolean,
    imageBaseUrl?: string
  ) {
    this._exerciseItems = [];
    this._includeLatex = includeLatex || false;
    this._currentExerciseImageBaseUrl = imageBaseUrl;

    this._exerciseItems = items.map(item => convertToQuestionBankItem(item));
    this._exerciseItems.sort((a, b) => a.order - b.order);

    // Shuffle options in selection
    if (printSetting && printSetting.shuffleOptionsInSelection) {
      this._exerciseItems.forEach(item => {
        if (item.itemType === QuestionBankTypeEnum.SingleChoice) {
          // Before shuffle, record the original answer
          let originalAnswer = '';
          if (item.answer) {
            originalAnswer = (item as QuestionBankItemSingleChoice).options[
              item.answer as keyof typeof VALID_OPTION_KEYS
            ]!;
            //console.log(`Original answer: ${item.answer}: ${originalAnswer}`);
          }

          const shuffrst = shuffleQuestionBankItemOption(
            (item as QuestionBankItemSingleChoice).options
          );
          (item as QuestionBankItemSingleChoice).options = shuffrst.newoptions;
          // Answer need be changed too
          if (item.answer) {
            item.answer = shuffrst.keyMapping[item.answer];

            const newAnswer = (item as QuestionBankItemSingleChoice).options[
              item.answer as keyof typeof VALID_OPTION_KEYS
            ];
            //console.log(`New answer: ${item.answer}: ${newAnswer}`);
            if (newAnswer !== originalAnswer) {
              console.error(
                `Answer changed: ${item.answer}: ${newAnswer} (original is ${originalAnswer})`
              );
            }
          }
        } else if (item.itemType === QuestionBankTypeEnum.MultipleChoice) {
          const shuffrst = shuffleQuestionBankItemOption(
            (item as QuestionBankItemMultipleChoice).options
          );
          (item as QuestionBankItemMultipleChoice).options = shuffrst.newoptions;
          // Answer need be changed too
          if (item.answer) {
            item.answer = shuffrst.keyMapping[item.answer];
          }
          // Answers need be changed too
          if (item.answers && item.answers.length > 0) {
            item.answers = item.answers.map(answer => shuffrst.keyMapping[answer]);
          }
        }
      });
    }

    this._exercisePrintSetting = printSetting;
  }

  get ExerciseItems(): QuestionBankItemBase<string>[] {
    return this._exerciseItems;
  }

  get ExercisePrintSetting(): KnowledgeExercisePrintOption | undefined {
    return this._exercisePrintSetting;
  }

  get IncludeLatex(): boolean {
    return this._includeLatex;
  }

  get CurrentExerciseImageBaseUrl(): string | undefined {
    return this._currentExerciseImageBaseUrl;
  }
}
