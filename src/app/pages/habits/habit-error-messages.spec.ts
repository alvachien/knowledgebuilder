import type { TranslocoService } from '@jsverse/transloco';

import { HABIT_ERROR_KEYS, habitErrorKey, habitErrorMessage, showHabitError } from './habit-error-messages';
import { HabitApiError } from './habit.models';

// The stub echoes keys, making translation-source assertions explicit.
const transloco = {
  translate: (key: string) => key,
} as unknown as TranslocoService;

describe('habitErrorKey', () => {
  it('maps every machine code the API can emit (spec § Error Handling)', () => {
    const codes = [
      'notFound', 'habitInactive', 'alreadyInactive', 'reactivationNotSupported', 'outOfWindow',
      'invalidDateRange', 'duplicateEntry', 'duplicateName', 'structuralChangeBlocked',
      'itemHasPunches', 'missingCycleTarget', 'missingCycle', 'invalidTarget',
      'invalidThreshold', 'noItems', 'itemWithoutProperties', 'scopeItemsRequired',
      'noCriteria', 'noRootCriterion', 'rootRequired',
      'rootCriterionProtected', 'circularCriterion', 'criterionInUse', 'invalidOperandCount',
      'unknownOperandName', 'invalidPropertyType', 'invalidBaseRate', 'invalidItemUniqueness',
      'invalidEnumValue', 'invalidName',
      // Shares (invitation) codes — U6: missing mappings leak raw English details.
      'invalidGrantee', 'missingShareOwnerName',
      // Codes introduced by the API review fixes (A2/A4/A-L1/A-L5).
      'missingPropertyType', 'missingCriterionType', 'duplicateReference',
      'validationTooLong', 'tooManyEntries', 'unauthenticated',
    ];
    for (const code of codes) {
      expect(habitErrorKey(code), code).toBe(`habits.errors.${code}`);
    }
    expect(Object.keys(HABIT_ERROR_KEYS).sort()).toEqual([...codes].sort());
  });

  it('returns null for unknown codes', () => {
    expect(habitErrorKey('mystery')).toBeNull();
  });
});

describe('habitErrorMessage', () => {
  it('translates known codes via the mapped key', () => {
    expect(habitErrorMessage(new HabitApiError('outOfWindow', 'x', 422), transloco)).toBe('habits.errors.outOfWindow');
  });

  it('maps the transport sentinel', () => {
    expect(habitErrorMessage(new HabitApiError('networkError', '', 0), transloco)).toBe('habits.errors.networkError');
  });

  it('localizes the shares codes instead of leaking the raw English detail (U6)', () => {
    expect(
      habitErrorMessage(new HabitApiError('invalidGrantee', "A habit's owner cannot be invited to their own habit.", 422), transloco)
    ).toBe('habits.errors.invalidGrantee');
    expect(
      habitErrorMessage(new HabitApiError('missingShareOwnerName', 'The caller\'s token carries no display name.', 422), transloco)
    ).toBe('habits.errors.missingShareOwnerName');
  });

  it('falls back to the raw detail for unknown codes', () => {
    expect(habitErrorMessage(new HabitApiError('futureCode', 'server said this', 400), transloco)).toBe('server said this');
  });

  it('falls back to httpError for non-API failures', () => {
    expect(habitErrorMessage(new Error('boom'), transloco)).toBe('habits.errors.httpError');
  });
});

describe('showHabitError', () => {
  it('opens a snackbar with the localized message and error panel class', () => {
    const calls: unknown[][] = [];
    const snackbar = {
      open: (...args: unknown[]) => {
        calls.push(args);
        return {};
      },
    } as unknown as Parameters<typeof showHabitError>[0];
    showHabitError(snackbar, transloco, new HabitApiError('notFound', '', 404));
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe('habits.errors.notFound');
    const options = calls[0][2] as { panelClass?: string[] };
    expect(options.panelClass).toEqual(['habit-error-snackbar']);
  });
});
