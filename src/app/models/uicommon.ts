// import { NativeDateAdapter } from "@angular/material/core";
// import { MatPaginatorIntl } from '@angular/material/paginator';

export const momentDateFormat = 'YYYY-MM-DD';

/**
 * Date range
 */
export enum StatisticsDateRangeEnum {
  CurrentMonth = 1,
  PreviousMonth = 2,
  CurrentYear = 3,
  PreviousYear = 4,
  All = 5,
}

/**
 * Group of nav. item
 */
export enum AppNavItemGroupEnum {
  home = 0,
  ps_basic = 1,
  ps_extend = 2,
  games = 3,
  award = 4,
  report = 5,
  help = 6,
  knowledge = 7,
  habit = 8,
  others = 10,
}

/**
 * Nav. item
 */
export interface AppNavItem {
  name: string;
  route: string;
  group: AppNavItemGroupEnum;
}

/**
 * App. language
 */
export interface AppLanguage {
  displayas: string;
  value: string;
}

// Filter operator
export enum GeneralFilterOperatorEnum {
  Equal = 1,
  NotEqual = 2,
  Between = 3,
  LargerThan = 4,
  LargerEqual = 5,
  LessThan = 6,
  LessEqual = 7,
  Like = 8, // Like
}

/**
 * Value type for filter
 */
export enum GeneralFilterValueType {
  number = 1,
  string = 2,
  date = 3,
  boolean = 4,
}

/**
 * Filter item
 */
export class GeneralFilterItem {
  fieldName: string;
  operator: GeneralFilterOperatorEnum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  valueType: GeneralFilterValueType;

  constructor() {
    this.fieldName = '';
    this.operator = GeneralFilterOperatorEnum.Equal;
    this.valueType = GeneralFilterValueType.string;
    this.value = [undefined, undefined];
  }
}

export enum ChineseChessAILevel {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}
export enum ChineseChessPlayMode {
  PlayerFirst = 0,
  AIFirst = 1,
  NoAI = 2,
}

// Handicap
export enum ChineseChessHandicap {
  None = 0,
  LeftKnight = 1,
  TwoKnights = 2,
  Nine = 3,
}

export enum ChineseChessBoardStyle {
  Wood = 'wood',
  Canvas = 'canvas',
  Drops = 'drops',
  Green = 'green',
  Qianhong = 'qianhong',
  Sheet = 'sheet',
  White = 'white',
}

export enum ChineseChessPieceStyle {
  Wood = 'wood',
  Delicate = 'delicate',
  Polish = 'polish',
}

export class EnumUtility {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getNamesAndValues<T extends number>(e: any) {
    return EnumUtility.getNames(e).map((n) => ({ name: n, value: e[n] as T }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getNames(e: any) {
    return Object.keys(e).filter((k) => typeof e[k] === 'number') as string[];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getValues<T extends number>(e: any) {
    return Object.keys(e)
      .map((k) => e[k])
      .filter((v) => typeof v === 'number') as T[];
  }
}

/**
 * UI Display string
 */

export type UIDisplayStringEnum =
  | GeneralFilterOperatorEnum
  | ChineseChessPlayMode
  | ChineseChessAILevel
  | ChineseChessHandicap
  | ChineseChessBoardStyle
  | ChineseChessPieceStyle;

export class UIDisplayString {
  public value: UIDisplayStringEnum;
  public i18nterm: string;
  public displaystring: string;

  constructor() {
    this.value = GeneralFilterOperatorEnum.Equal;
    this.i18nterm = '';
    this.displaystring = '';
  }
}

export class UIDisplayStringUtil {
  public static getGeneralFilterOperatorDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const rfe in GeneralFilterOperatorEnum) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getGeneralFilterOperatorDisplayString(+rfe),
          displaystring: '',
        });
      }
    }

    return arrst;
  }
  public static getGeneralFilterOperatorDisplayString(opte: GeneralFilterOperatorEnum): string {
    switch (opte) {
      case GeneralFilterOperatorEnum.Between:
        return 'Sys.Operator.Between';
      case GeneralFilterOperatorEnum.Equal:
        return 'Sys.Operator.Equal';
      case GeneralFilterOperatorEnum.LargerEqual:
        return 'Sys.Operator.LargerEqual';
      case GeneralFilterOperatorEnum.LargerThan:
        return 'Sys.Operator.LargerThan';
      case GeneralFilterOperatorEnum.LessEqual:
        return 'Sys.Operator.LessEqual';
      case GeneralFilterOperatorEnum.LessThan:
        return 'Sys.Operator.LessThan';
      case GeneralFilterOperatorEnum.NotEqual:
        return 'Sys.Operator.NotEqual';
      case GeneralFilterOperatorEnum.Like:
        return 'Sys.Operator.Like';
      default:
        return '';
    }
  }

  public static getChineseChessPlayModeDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    // for (const rfe in EnumUtility.getValues(ChineseChessPlayMode)) {
    //   arrst.push({
    //     value: +rfe,
    //     i18nterm: UIDisplayStringUtil.getGeneralFilterOperatorDisplayString(+rfe),
    //     displaystring: '',
    //   });
    // }
    for (const rfe in ChineseChessPlayMode) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getChineseChessPlayModeDisplayString(+rfe),
          displaystring: '',
        });
      }
    }

    return arrst;
  }
  public static getChineseChessPlayModeDisplayString(opts: ChineseChessPlayMode): string {
    switch (opts) {
      case ChineseChessPlayMode.AIFirst:
        return `PuzzleGames.ComputerFirst`;
      case ChineseChessPlayMode.PlayerFirst:
        return `PuzzleGames.PlayerFirst`;
      case ChineseChessPlayMode.NoAI:
        return `PuzzleGames.TwoPlayers`;
      default:
        return '';
    }
  }

  public static getChineseChessAILevelDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const rfe in ChineseChessAILevel) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getChineseChessAILevelDisplayString(+rfe),
          displaystring: '',
        });
      }
    }

    return arrst;
  }
  public static getChineseChessAILevelDisplayString(opts: ChineseChessAILevel): string {
    switch (opts) {
      case ChineseChessAILevel.Medium:
        return `PuzzleGames.Medium`;
      case ChineseChessAILevel.Easy:
        return `PuzzleGames.Easy`;
      case ChineseChessAILevel.Hard:
        return `PuzzleGames.Hard`;
      default:
        return '';
    }
  }

  public static getChineseChessHandicapDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const rfe in ChineseChessAILevel) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getChineseChessAILevelDisplayString(+rfe),
          displaystring: '',
        });
      }
    }

    return arrst;
  }
  public static getChineseChessHandicapDisplayString(opts: ChineseChessHandicap): string {
    switch (opts) {
      case ChineseChessHandicap.LeftKnight:
        return `PuzzleGames.LeftKnight`;
      case ChineseChessHandicap.Nine:
        return `PuzzleGames.NinePiece`;
      case ChineseChessHandicap.TwoKnights:
        return `PuzzleGames.TwoKnights`;
      case ChineseChessHandicap.None:
        return 'PuzzleGames.NoHandicap';
      default:
        return '';
    }
  }
  public static getChineseChessBoardStyleDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    arrst.push({
      value: ChineseChessBoardStyle.Wood,
      displaystring: ChineseChessBoardStyle.Wood,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessBoardStyle.Canvas,
      displaystring: ChineseChessBoardStyle.Canvas,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessBoardStyle.Drops,
      displaystring: ChineseChessBoardStyle.Drops,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessBoardStyle.Green,
      displaystring: ChineseChessBoardStyle.Green,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessBoardStyle.Qianhong,
      displaystring: ChineseChessBoardStyle.Qianhong,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessBoardStyle.Sheet,
      displaystring: ChineseChessBoardStyle.Sheet,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessBoardStyle.White,
      displaystring: ChineseChessBoardStyle.White,
      i18nterm: '',
    });

    return arrst;
  }
  public static getChineseChessPieceStyleDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    arrst.push({
      value: ChineseChessPieceStyle.Wood,
      displaystring: ChineseChessPieceStyle.Wood,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessPieceStyle.Delicate,
      displaystring: ChineseChessPieceStyle.Delicate,
      i18nterm: '',
    });
    arrst.push({
      value: ChineseChessPieceStyle.Polish,
      displaystring: ChineseChessPieceStyle.Polish,
      i18nterm: '',
    });

    return arrst;
  }
}

// export enum MessageType {
//   Success = 0,
//   Info = 1,
//   Warning = 2,
//   Error = 3 }

// /**
//  * Info message class
//  */
// export class InfoMessage {
//   // tslint:disable:variable-name
//   private _msgType: MessageType;
//   private _msgTime: moment.Moment;
//   private _msgTitle: string;
//   private _msgContent: string;
//   constructor(msgtype?: MessageType, msgtitle?: string, msgcontent?: string) {
//     this.MsgTime = moment();
//     if (msgtype) {
//       this.MsgType = msgtype;
//     }
//     if (msgtitle) {
//       this.MsgTitle = msgtitle;
//     }
//     if (msgcontent) {
//       this.MsgContent = msgcontent;
//     }
//   }

//   get MsgType(): MessageType {
//     return this._msgType;
//   }
//   set MsgType(mt: MessageType) {
//     this._msgType = mt;
//   }
//   get MsgTime(): moment.Moment {
//     return this._msgTime;
//   }
//   set MsgTime(mt: moment.Moment) {
//     this._msgTime = mt;
//   }
//   get MsgTitle(): string {
//     return this._msgTitle;
//   }
//   set MsgTitle(mt: string) {
//     this._msgTitle = mt;
//   }
//   get MsgContent(): string {
//     return this._msgContent;
//   }
//   set MsgContent(mc: string) {
//     this._msgContent = mc;
//   }

//   get IsError(): boolean {
//     return this.MsgType === MessageType.Error;
//   }
//   get IsWarning(): boolean {
//     return this.MsgType === MessageType.Warning;
//   }
//   get IsInfo(): boolean {
//     return this.MsgType === MessageType.Info;
//   }
// }
