import * as moment from 'moment';

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

/**
 * Indicates a field is changable based on current mode
 *
 * @param mode Current UI mode
 * @returns true means it is editable
 *
 */
export function isFieldEditable(mode: UIModeEnum): boolean {
  return mode === UIModeEnum.edit || mode === UIModeEnum.create;
}

/**
 * Get display string for current Model.
 *
 * @param mode Current UI mode
 * @returns A string for translation
 *
 */
export function getUIModeString(mode: UIModeEnum): string {
  switch (mode) {
    case UIModeEnum.create:
    return 'Common.Create';

    case UIModeEnum.edit:
      return 'Common.Edit';

    case UIModeEnum.display:
      return 'Common.Display';

    default:
      return '';
  }
}

/**
 * Get display string for knowledge category.
 *
 * @param ctgy Knowledge category
 * @returns A string for translation
 *
 */
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

export enum MessageType {
  Success = 0,
  Info = 1,
  Warning = 2,
  Error = 3 }

/**
 * Info message class
 */
export class InfoMessage {
  // tslint:disable:variable-name
  private _msgType: MessageType;
  private _msgTime: moment.Moment;
  private _msgTitle: string;
  private _msgContent: string;
  constructor(msgtype?: MessageType, msgtitle?: string, msgcontent?: string) {
    this.MsgTime = moment();
    if (msgtype) {
      this.MsgType = msgtype;
    }
    if (msgtitle) {
      this.MsgTitle = msgtitle;
    }
    if (msgcontent) {
      this.MsgContent = msgcontent;
    }
  }

  get MsgType(): MessageType {
    return this._msgType;
  }
  set MsgType(mt: MessageType) {
    this._msgType = mt;
  }
  get MsgTime(): moment.Moment {
    return this._msgTime;
  }
  set MsgTime(mt: moment.Moment) {
    this._msgTime = mt;
  }
  get MsgTitle(): string {
    return this._msgTitle;
  }
  set MsgTitle(mt: string) {
    this._msgTitle = mt;
  }
  get MsgContent(): string {
    return this._msgContent;
  }
  set MsgContent(mc: string) {
    this._msgContent = mc;
  }

  get IsError(): boolean {
    return this.MsgType === MessageType.Error;
  }
  get IsWarning(): boolean {
    return this.MsgType === MessageType.Warning;
  }
  get IsInfo(): boolean {
    return this.MsgType === MessageType.Info;
  }
}
