import { Injectable } from '@angular/core';
import { format } from 'date-fns';

import { ChineseExerciseTypeEnum, QuestionBankItemLevelEnum } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  getEntryDateString(valdate?: Date): string {
    const entryDateStr = `Date: ${valdate ? format(valdate, 'yyyy-MM-dd') : '__________'}. Start: _____, End: _____. Score: ____`;
    return entryDateStr;
  }

  getChineseExerciseTypeString(exercise: ChineseExerciseTypeEnum): string {
    switch (exercise) {
      case ChineseExerciseTypeEnum.ClassicalChinese:
        return '古诗词、文言文';
      case ChineseExerciseTypeEnum.Composition:
        return '作文';
      case ChineseExerciseTypeEnum.Imitation:
        return '仿写';
      case ChineseExerciseTypeEnum.FamousQuotation:
        return '名言警句';
      case ChineseExerciseTypeEnum.Reading:
        return '阅读笔记';
      default:
        return '';
    }
  }
  getExerciseLevelString(execlevel: QuestionBankItemLevelEnum): string {
    switch (execlevel) {
      case QuestionBankItemLevelEnum.Easy:
        return '简单';
      case QuestionBankItemLevelEnum.Medium:
        return '中等';
      case QuestionBankItemLevelEnum.Hard:
        return '困难';
      default:
        return '未定义';
    }
  }

  isChineseExerciseTypeHasContent(exectype: ChineseExerciseTypeEnum): boolean {
    return exectype === ChineseExerciseTypeEnum.ClassicalChinese || exectype === ChineseExerciseTypeEnum.Composition || exectype === ChineseExerciseTypeEnum.FamousQuotation || exectype === ChineseExerciseTypeEnum.Reading;
  }

}
