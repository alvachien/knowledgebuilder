import { NativeDateAdapter } from "@angular/material/core";

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

export class AppDateAdapter extends NativeDateAdapter {format(date: Date, displayFormat: any): string {
  if (displayFormat === 'DISPLAY') {
    return date.toISOString();
  }
  return date.toDateString();
}}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'PARSE',
  },
  display: {
    dateInput: 'DISPLAY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
