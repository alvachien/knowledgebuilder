export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export enum SelectionModeEnum {
  'ByID' = 0,
  'FreeSelection' = 1,
  'ByCount' = 2,
}
export type SelectionModeEnumKeys = keyof typeof SelectionModeEnum;

export enum RatingOperatorEnum {
  'Equals' = 0,
  'GreaterThan' = 1,
  'LessThan' = 2,
  'HasAny' = 3,
  'HasNone' = 4,
  'LargerOrEquals' = 5,
  'LessOrEquals' = 6,
}
export type RatingOperatorEnumKeys = keyof typeof RatingOperatorEnum;

export const getSelectionModeName = (itemType: SelectionModeEnum): string => {
  switch (itemType) {
    case SelectionModeEnum.ByID:
      return 'By ID';
    case SelectionModeEnum.FreeSelection:
      return 'Free Selection';
    case SelectionModeEnum.ByCount:
      return 'By Count';
    default:
      return 'Unknown';
  }
};

export const getSelectionModeNames = (): Map<SelectionModeEnum, string> => {
  const map = new Map<SelectionModeEnum, string>();
  map.set(SelectionModeEnum.ByID, getSelectionModeName(SelectionModeEnum.ByID));
  map.set(SelectionModeEnum.FreeSelection, getSelectionModeName(SelectionModeEnum.FreeSelection));
  map.set(SelectionModeEnum.ByCount, getSelectionModeName(SelectionModeEnum.ByCount));
  return map;
};

export const getRatingOperatorName = (operator: RatingOperatorEnum): string => {
  switch (operator) {
    case RatingOperatorEnum.Equals:
      return 'Equals';
    case RatingOperatorEnum.GreaterThan:
      return 'Greater Than';
    case RatingOperatorEnum.LessThan:
      return 'Less Than';
    case RatingOperatorEnum.HasAny:
      return 'Has Any';
    case RatingOperatorEnum.HasNone:
      return 'Has None';
    case RatingOperatorEnum.LargerOrEquals:
      return 'Larger or Equals';
    case RatingOperatorEnum.LessOrEquals:
      return 'Less or Equals';
    default:
      return 'Unknown';
  }
};

/**
 * Shared rating comparison used by the vocabulary list filter bar (rating
 * conditions) so all rating matching goes through one place.
 * Note: LessThan / LessOrEquals intentionally exclude unrated (0) words — a
 * rating of 0 means "not yet assessed", which is covered by HasNone. This keeps
 * LessThan 1 from collapsing into HasNone.
 */
export const matchRating = (
  rating: number,
  operator: RatingOperatorEnum,
  value: number
): boolean => {
  switch (operator) {
    case RatingOperatorEnum.Equals:
      return rating === value;
    case RatingOperatorEnum.GreaterThan:
      return rating > value;
    case RatingOperatorEnum.LargerOrEquals:
      return rating >= value;
    case RatingOperatorEnum.LessThan:
      return rating > 0 && rating < value;
    case RatingOperatorEnum.LessOrEquals:
      return rating > 0 && rating <= value;
    case RatingOperatorEnum.HasAny:
      return rating > 0;
    case RatingOperatorEnum.HasNone:
      return rating === 0;
    default:
      return false;
  }
};

// Detect if a string contains Chinese characters
export const hasChinese = (str: string): boolean => {
  return /[\u4e00-\u9fa5]/.test(str);
};

// Replace At Symbols within a string
// Normal it used for printing mode.
export const replaceAtSymbols = (
  str: string,
  replaceStr = ' ',
  lengthFactor = 1,
  fixedLength?: number
): string => {
  const hasChineseInContent = hasChinese(str);
  return str.replace(/@([^@]*)@/g, (match, content) => {
    // Calculate the length based on content (without @ symbols) for better proportionality
    // The underline should match the length of the missing content, not including delimiters
    const contentLength = hasChineseInContent ? content.length * 4 : content.length * 2;
    // When fixedLength is set, the blank width is uniform and does NOT reflect the
    // answer content's length (used by vocabulary prints so the blank hides the word length).
    const totalLength =
      fixedLength && fixedLength > 0 ? fixedLength : Math.max(1, Math.round(contentLength * lengthFactor));

    // For HTML underline replacement, we need to handle line breaks
    if (replaceStr === '<u>&nbsp;</u>') {
      // Create underlined spaces with break opportunities for long blanks
      // We'll insert zero-width spaces periodically to allow line breaks
      const breakInterval = 10; // Insert break opportunity every N characters

      // For very short blanks, no need for breaks
      if (totalLength <= breakInterval) {
        return '<u>' + '&nbsp;'.repeat(totalLength) + '</u>';
      }

      // For longer blanks, insert break opportunities
      let result = '<u>';
      let segmentCount = 0;

      for (let i = 0; i < totalLength; i++) {
        result += '&nbsp;';
        segmentCount++;

        // Insert zero-width space after every breakInterval characters
        // (except the last segment to avoid trailing break)
        if (segmentCount >= breakInterval && i < totalLength - 1) {
          result += '</u>&#8203;<u>'; // Close and reopen underline with zero-width space
          segmentCount = 0;
        }
      }

      result += '</u>';
      return result;
    }

    // For other replacement strings, use the original logic
    return replaceStr.repeat(totalLength);
  });
};
