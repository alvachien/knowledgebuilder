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
}

export interface ChineseReciteOption extends ChineseRecitetOptionAbstract {
  allowEmptyAnswer: boolean;
}
