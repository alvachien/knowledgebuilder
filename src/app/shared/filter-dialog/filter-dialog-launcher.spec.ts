import type { DestroyRef } from '@angular/core';
import type { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FilterJoinType, FilterOperation } from 'actslib';
import type { FilterRoot, IFilterCondition } from 'actslib';
import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  FILTER_DIALOG_CONFIG,
  openFilterDialog,
} from './filter-dialog-launcher';
import type { FilterDialogResult, FilterableProperty } from './filter-dialog-model';
import { SharedFilterDialogComponent } from './filter-dialog.component';

const SCHEMA: FilterableProperty[] = [
  { key: 'enword', labelKey: 'test.word', kind: 'string' },
];

const bare: IFilterCondition = {
  property: 'enword',
  operation: FilterOperation.Contains,
  lowValue: 'app',
};

describe('openFilterDialog', () => {
  let dialog: MatDialog;
  let openSpy: ReturnType<typeof vi.fn>;
  let emitResult: FilterDialogResult | undefined;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    openSpy = vi.fn(() => ({
      afterClosed: () => of(emitResult),
    }) as unknown as MatDialogRef<SharedFilterDialogComponent, FilterDialogResult | undefined>);
    dialog = { open: openSpy } as unknown as MatDialog;
    // The launcher only ever REGISTERS the teardown (takeUntilDestroyed); the
    // spec never destroys, so a no-op onDestroy is faithful.
    destroyRef = { onDestroy: vi.fn() } as unknown as DestroyRef;
  });

  const launch = (onApplied = vi.fn()): ReturnType<typeof vi.fn> => {
    openFilterDialog(dialog, {
      destroyRef,
      properties: SCHEMA,
      current: bare,
      onApplied,
    });
    return onApplied;
  };

  it('opens the shared dialog with the seeded root and the standard config', () => {
    launch();
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toBe(SharedFilterDialogComponent);
    const config = openSpy.mock.calls[0][1] as { data: { properties: FilterableProperty[]; root: FilterRoot } };
    expect(config.data.properties).toBe(SCHEMA);
    expect(config.data.root).toEqual(bare);
    expect(config).toEqual(expect.objectContaining(FILTER_DIALOG_CONFIG));
  });

  it('passes the optional maxDepth/titleKey overrides through', () => {
    openFilterDialog(dialog, {
      destroyRef,
      properties: SCHEMA,
      current: undefined,
      maxDepth: 2,
      titleKey: 'test.title',
      onApplied: vi.fn(),
    });
    const config = openSpy.mock.calls[0][1] as { data: { maxDepth?: number; titleKey?: string; root?: FilterRoot } };
    expect(config.data.maxDepth).toBe(2);
    expect(config.data.titleKey).toBe('test.title');
    expect(config.data.root).toBeUndefined();
  });

  it('runs onApplied with the submitted root (Submit)', () => {
    emitResult = { root: { join: FilterJoinType.AND, conditions: [bare] } };
    const onApplied = launch();
    expect(onApplied).toHaveBeenCalledTimes(1);
    expect(onApplied).toHaveBeenCalledWith(emitResult.root);
  });

  it('leaves the previous filter untouched on Cancel (undefined result)', () => {
    emitResult = undefined;
    const onApplied = launch();
    expect(onApplied).not.toHaveBeenCalled();
  });
});
