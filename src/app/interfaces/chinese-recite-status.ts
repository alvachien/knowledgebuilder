import type { QuestionBankItemLevelEnum } from "./questionbank";

export enum ChineseReciteStatusEnum {
  'NotStarted' = 0,
  'InProgress' = 1,
  'Completed' = 2,
}

export interface ChineseReciteStatus {
  status: ChineseReciteStatusEnum;
  //level: ChineseReciteLevelEnum;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  startTime: Date;
  endTime: Date;
}

export interface ChineseRecitetOptionAbstract {
  selectedLevel: QuestionBankItemLevelEnum;
  countOfItems: number;
}

export interface ChineseRecitePrintOption extends ChineseRecitetOptionAbstract {
  printEntryDate?: boolean;
  respectRetentionCurve?: boolean;
  printExecDate?: boolean;
  execDate?: Date;
  // When true, the answer key renders each item's answer on its own line
  // (line break between items instead of an inline em-space). Default off.
  answerLineBreakPerItem?: boolean;
}

export interface ChineseReciteOption extends ChineseRecitetOptionAbstract {
  allowEmptyAnswer: boolean;
}
