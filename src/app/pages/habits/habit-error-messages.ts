import type { MatSnackBar } from '@angular/material/snack-bar';
import type { TranslocoService } from '@jsverse/transloco';

import { HabitApiError } from './habit.models';

// Maps the API's machine-readable error codes (extensions.code on ProblemDetails)
// to transloco keys under `habits.errors.*`. Unknown codes fall back to the raw
// `detail` string, same contract as the reference habit-ui (docs/design-habit-ui.md
// § Error Handling).

/** Translates a normalized HabitApiError (or generic failure) to a user message. */
export function habitErrorMessage(err: unknown, transloco: TranslocoService): string {
  if (err instanceof HabitApiError) {
    if (err.code === 'networkError') {
      return transloco.translate('habits.errors.networkError');
    }
    const key = habitErrorKey(err.code);
    if (key) {
      return transloco.translate(key);
    }
    return err.detail || transloco.translate('habits.errors.httpError');
  }
  return transloco.translate('habits.errors.httpError');
}

/** Shows an API failure in a snack bar with the localized message. */
export function showHabitError(snackbar: MatSnackBar, transloco: TranslocoService, err: unknown): void {
  snackbar.open(habitErrorMessage(err, transloco), undefined, { duration: 5000, panelClass: ['habit-error-snackbar'] });
}

export const HABIT_ERROR_KEYS: Record<string, string> = {
  notFound: 'habits.errors.notFound',
  habitInactive: 'habits.errors.habitInactive',
  alreadyInactive: 'habits.errors.alreadyInactive',
  reactivationNotSupported: 'habits.errors.reactivationNotSupported',
  outOfWindow: 'habits.errors.outOfWindow',
  invalidDateRange: 'habits.errors.invalidDateRange',
  duplicateEntry: 'habits.errors.duplicateEntry',
  duplicateName: 'habits.errors.duplicateName',
  structuralChangeBlocked: 'habits.errors.structuralChangeBlocked',
  itemHasPunches: 'habits.errors.itemHasPunches',
  missingCycleTarget: 'habits.errors.missingCycleTarget',
  missingCycle: 'habits.errors.missingCycle',
  invalidTarget: 'habits.errors.invalidTarget',
  invalidThreshold: 'habits.errors.invalidThreshold',
  noItems: 'habits.errors.noItems',
  itemWithoutProperties: 'habits.errors.itemWithoutProperties',
  scopeItemsRequired: 'habits.errors.scopeItemsRequired',
  noCriteria: 'habits.errors.noCriteria',
  noRootCriterion: 'habits.errors.noRootCriterion',
  rootRequired: 'habits.errors.rootRequired',
  rootCriterionProtected: 'habits.errors.rootCriterionProtected',
  circularCriterion: 'habits.errors.circularCriterion',
  criterionInUse: 'habits.errors.criterionInUse',
  invalidOperandCount: 'habits.errors.invalidOperandCount',
  unknownOperandName: 'habits.errors.unknownOperandName',
  invalidPropertyType: 'habits.errors.invalidPropertyType',
  invalidBaseRate: 'habits.errors.invalidBaseRate',
  invalidItemUniqueness: 'habits.errors.invalidItemUniqueness',
  invalidEnumValue: 'habits.errors.invalidEnumValue',
  invalidName: 'habits.errors.invalidName',
  // Shares (invitation) failures — backend HabitErrorCodes; without these the
  // raw English `detail` would leak into the zh-CN UI on a self-invite.
  invalidGrantee: 'habits.errors.invalidGrantee',
  missingShareOwnerName: 'habits.errors.missingShareOwnerName',
  // Codes introduced by the API review fixes (A2/A4/A-L1/A-L5) — kept mapped so no
  // backend failure leaks an untranslated English detail into the zh-CN UI.
  missingPropertyType: 'habits.errors.missingPropertyType',
  missingCriterionType: 'habits.errors.missingCriterionType',
  duplicateReference: 'habits.errors.duplicateReference',
  validationTooLong: 'habits.errors.validationTooLong',
  tooManyEntries: 'habits.errors.tooManyEntries',
  unauthenticated: 'habits.errors.unauthenticated',
};

export function habitErrorKey(code: string): string | null {
  return Object.prototype.hasOwnProperty.call(HABIT_ERROR_KEYS, code) ? HABIT_ERROR_KEYS[code] : null;
}
