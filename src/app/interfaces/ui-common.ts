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

// Detect if a string contains Chinese characters
export const hasChinese = (str: string): boolean => {
  return /[\u4e00-\u9fa5]/.test(str);
};

// Replace At Symbols within a string
// Normal it used for printing mode.
export const replaceAtSymbols = (str: string, replaceStr = ' ', lengthFactor = 1): string => {
  const hasChineseInContent = hasChinese(str);
  return str.replace(/@([^@]*)@/g, (match, content) => {
    // Calculate the length based on content (without @ symbols) for better proportionality
    // The underline should match the length of the missing content, not including delimiters
    const contentLength = hasChineseInContent ? content.length * 4 : content.length * 2;
    const totalLength = Math.max(1, Math.round(contentLength * lengthFactor));

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
