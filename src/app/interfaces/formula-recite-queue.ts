export interface FormulaReciteContent {
  name: string;
  value: string;
  math: boolean;
  source?: string;
}

export interface FormulaRecitePrintOption {
  subtitle?: string;
  countOfItems: number;
  printEntryDate: boolean;
  printSource: boolean;
  randomOrder: boolean;
  respectRetentionCurve?: boolean;
  printExecDate?: boolean;
  execDate?: Date;
}

export enum FormulaReciteAIModeEnum {
  'Explain' = 0,
  'MoreQuiz' = 1,
}
