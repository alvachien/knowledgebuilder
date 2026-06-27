import type { LearnEnglishSentFileItem } from './learnenglish';

export interface TranslateQueue extends LearnEnglishSentFileItem {
  completed: boolean;
  inputted: string;
}

export enum TranslationAIModeEnum {
  'Explain' = 0,
  'Correct' = 1,
}

export enum TranslateDirectionEnum {
  'EnglishToChinese' = 0,
  'ChineseToEnglish' = 1,
}

// UI Status
export enum TranslateExerciseStatusEnum {
  'NotStarted' = 0,
  'InProgress' = 1,
  'Completed' = 2,
}

export interface TranslateExerciseUIStatus {
  status: TranslateExerciseStatusEnum;
  
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  startTime: Date;
  endTime: Date;
}

export interface TranslateExercisePrintOption {
  printAnswer: boolean;
  printWord: boolean;
  printEntryDate: boolean;
  countOfItems: number;
  direction: TranslateDirectionEnum;
  printExecDate?: boolean;
  execDate?: Date;
  respectRetentionCurve?: boolean;
}

export interface TranslateExerciseOption {
  allowEmptyAnswer: boolean;
  countOfItems: number;
  direction: TranslateDirectionEnum;
}
