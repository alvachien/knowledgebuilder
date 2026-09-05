// The one-call entry point list pages use to open the shared filter dialog
// (docs/reusable-filter-dialog-design.md §10). The sizing/animation config,
// the seed wiring and the Cancel guard are the whole open contract — they
// were byte-identical in every page that grew them locally (review M4), so
// they live here once.

import type { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import type { FilterRoot } from 'actslib';

import type { FilterDialogData, FilterDialogResult, FilterableProperty } from './filter-dialog-model';
import { SharedFilterDialogComponent } from './filter-dialog.component';

/**
 * Standard dialog config for the filter editor: the tree navigator + detail
 * pane sit side by side; the splitter can resize them but needs the extra
 * width to start from. The cap keeps the dialog inside smaller viewports.
 */
export const FILTER_DIALOG_CONFIG: Pick<
  MatDialogConfig,
  'width' | 'maxWidth' | 'enterAnimationDuration' | 'exitAnimationDuration'
> = {
  width: '800px',
  maxWidth: '96vw',
  enterAnimationDuration: 800,
  exitAnimationDuration: 500,
};

/** Everything `openFilterDialog` needs: the page's schema, the seed, the
 *  optional dialog overrides, and what to do with an applied filter. */
export interface FilterDialogLaunch {
  /** the caller's injection context, for the `afterClosed` subscription */
  destroyRef: DestroyRef;
  properties: FilterableProperty[];
  /** the filter in effect (any `FilterRoot` spelling; undefined opens empty) */
  current: FilterRoot | undefined;
  maxDepth?: number;
  titleKey?: string;
  /** called only with a SUBMIT result — the dialog emits cases 1/2 */
  onApplied: (root: FilterRoot) => void;
}

/**
 * Open the shared filter dialog seeded with the filter in effect and run
 * `onApplied` on the Submit result. Cancel / backdrop / Esc yield
 * `undefined` and leave the previous filter untouched; case 0 cannot come
 * out of the dialog (clearing is the pages' Clear Filter button).
 */
export function openFilterDialog(dialog: MatDialog, launch: FilterDialogLaunch): void {
  const data: FilterDialogData = {
    properties: launch.properties,
    root: launch.current,
    maxDepth: launch.maxDepth,
    titleKey: launch.titleKey,
  };
  dialog
    .open<SharedFilterDialogComponent, FilterDialogData, FilterDialogResult | undefined>(
      SharedFilterDialogComponent,
      { data, ...FILTER_DIALOG_CONFIG }
    )
    .afterClosed()
    .pipe(takeUntilDestroyed(launch.destroyRef))
    .subscribe(result => {
      if (result !== undefined) {
        launch.onApplied(result.root);
      }
    });
}
