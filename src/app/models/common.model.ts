
export enum UIModeEnum {
  create = 1,
  edit = 2,
  display = 3,
}

export enum KnowledgeCategoryEnum {
  Concept = 0,  // theorem
  Formula = 1,
}

export enum QuestionBankCategoryEnum {
  Calculation = 0, // Question and Answer
}

export function isFieldEditable(mode: UIModeEnum): boolean {
  return mode === UIModeEnum.edit || mode === UIModeEnum.create;
}
export function getknowlegeCategoryDisplayString(ctgy: KnowledgeCategoryEnum): string {
  switch (ctgy) {
    case KnowledgeCategoryEnum.Concept:
      return 'Concept';
    case KnowledgeCategoryEnum.Formula:
      return 'Formular';
    default:
      return '';
  }
}
export function getQuestionBankCategoryDisplayString(ctgy: QuestionBankCategoryEnum): string {
  switch (ctgy) {
    case QuestionBankCategoryEnum.Calculation:
      return 'Calculation';
    default:
      return '';
  }
}

export class SelectableObject<T> {
  public selected: boolean;
  public obj: T;
  constructor(inst: T, selected?: boolean) {
    this.obj = inst;
    if (selected) {
      this.selected = true;
    } else {
      this.selected = false;
    }
  }
}

export class EnumUtility {
  private constructor() {
  }

  static getNamesAndValues<T extends number>(e: any) {
    return EnumUtility.getNames(e).map(n => ({ name: n, value: e[n] as T }));
  }

  static getNames(e: any) {
    return Object.keys(e).filter(k => typeof e[k] === 'number') as string[];
  }

  static getValues<T extends number>(e: any) {
    return Object.keys(e)
      .map(k => e[k])
      .filter(v => typeof v === 'number') as T[];
  }
}
