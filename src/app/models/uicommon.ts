import { Injectable } from "@angular/core";
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
