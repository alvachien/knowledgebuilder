
/**
 * UI mode
 */
export enum UIMode {
  ListView = 0,
  Create = 1,
  Update = 2,
  Display = 3
}

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
