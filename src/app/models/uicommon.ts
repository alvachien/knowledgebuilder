import { NativeDateAdapter } from "@angular/material/core";
import { MatPaginatorIntl } from '@angular/material/paginator';

/**
  * Date range
  */
export enum StatisticsDateRangeEnum {
  CurrentMonth = 1,
  PreviousMonth = 2,
  CurrentYear = 3,
  PreviousYear = 4,
  All = 5
}

/**
 * Group of nav. item
 */
export enum AppNavItemGroupEnum {
  home = 0,
  ps_basic  = 1,
  ps_extend = 2,
  games = 3,
  award = 4,
  report = 5,
  help = 6,
  knowledge = 7,
  others = 10
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
  value: any[];
  valueType: GeneralFilterValueType;

  constructor() {
    this.fieldName = '';
    this.operator = GeneralFilterOperatorEnum.Equal;
    this.valueType = GeneralFilterValueType.string;
    this.value = [undefined, undefined];
  }
}

/**
 * UI Display string
 */
export class UIDisplayString {
  public value: GeneralFilterOperatorEnum;
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
      case GeneralFilterOperatorEnum.Between: return 'Sys.Operator.Between';
      case GeneralFilterOperatorEnum.Equal: return 'Sys.Operator.Equal';
      case GeneralFilterOperatorEnum.LargerEqual: return 'Sys.Operator.LargerEqual';
      case GeneralFilterOperatorEnum.LargerThan: return 'Sys.Operator.LargerThan';
      case GeneralFilterOperatorEnum.LessEqual: return 'Sys.Operator.LessEqual';
      case GeneralFilterOperatorEnum.LessThan: return 'Sys.Operator.LessThan';
      case GeneralFilterOperatorEnum.NotEqual: return 'Sys.Operator.NotEqual';
      case GeneralFilterOperatorEnum.Like: return 'Sys.Operator.Like';
      default: return '';
    }
  }
}


// @Injectable()
// export class AppDateAdapter extends NativeDateAdapter {format(date: Date, displayFormat: any): string {
//   if (displayFormat === 'DISPLAY') {
//     return date.toISOString();
//   }
//   return date.toDateString();
// }}

// export const MY_DATE_FORMATS = {
//   parse: {
//     dateInput: 'PARSE',
//   },
//   display: {
//     dateInput: 'DISPLAY',
//     monthYearLabel: 'MMM YYYY',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'MMMM YYYY',
//   },
// };

// @Injectable()
// export class MatPaginatorIntlCro extends MatPaginatorIntl {
//   itemsPerPageLabel = 'Stavki po stranici';
//   nextPageLabel     = 'Slijedeća stranica';
//   previousPageLabel = 'Prethodna stranica';

//   getRangeLabel = function (page, pageSize, length) {
//     if (length === 0 || pageSize === 0) {
//       return '0 od ' + length;
//     }
//     length = Math.max(length, 0);
//     const startIndex = page * pageSize;
//     // If the start index exceeds the list length, do not try and fix the end index to the end.
//     const endIndex = startIndex < length ?
//       Math.min(startIndex + pageSize, length) :
//       startIndex + pageSize;
//     return startIndex + 1 + ' - ' + endIndex + ' od ' + length;
//   };
// }
