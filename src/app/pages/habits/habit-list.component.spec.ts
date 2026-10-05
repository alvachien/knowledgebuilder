import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';

import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import { HabitListComponent } from './habit-list.component';
import { HabitSharesDialogComponent } from './habit-shares-dialog.component';
import type { CriterionProgressOut, Habit } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Card-level Punch-button gating (FR-3.3, revised spec): the API gates NEW
 * punches on the PUNCH DATE, so an active habit whose period already ended
 * still accepts back-fills for past in-window days — its button stays. The
 * affordance disappears only for future-start habits and inactive habits.
 */

function day(offset: number): string {
  const d = isoToDate(todayIso());
  d.setDate(d.getDate() + offset);
  return dateToIso(d);
}

const root: CriterionProgressOut = {
  criterionId: 1,
  name: 'Goal',
  isRoot: true,
  criterionType: 'condition',
  passed: false,
  propertyName: 'distance',
  aggregationMode: null,
  currentValue: 5,
  threshold: 30,
  successType: 'cumulative',
  cycleTarget: null,
  currentDayValue: null,
  successfulDays: null,
  operator: null,
  operandIds: null,
};

function makeHabit(over: Partial<Habit>): Habit {
  return {
    id: 1,
    name: 'Run',
    description: null,
    cycle: 'weekly',
    startDate: day(-3),
    endDate: null,
    state: 'active',
    hasPunches: false,
    createdAt: '',
    progress: { cycleFrom: day(-3), cycleTo: day(3), rootCriterion: root, criteria: [] },
    ...over,
  };
}

const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function renderList(habits: Habit[]) {
  const service = {
    getHabits: vi.fn(() => of(habits)),
    getHabit: vi.fn(),
    deleteHabit: vi.fn(),
    deactivateHabit: vi.fn(),
  };
  const snackbar = { open: vi.fn() };
  const dialog = { open: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: MatDialog, useValue: dialog },
      // RouterLink injects ActivatedRoute (required dep in v22) — stub like the journeys spec.
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatSnackBar, useValue: snackbar },
      {
        provide: TranslocoService,
        useValue: {
          translate: vi.fn((key: string) => key),
          setActiveLang: vi.fn(),
          getActiveLang: vi.fn(() => 'en'),
          selectTranslate: vi.fn().mockReturnValue(of('')),
          _loadDependencies: vi.fn().mockReturnValue(of(null)),
          langChanges$: of('en'),
          events$: of(),
          activeLang: 'en',
          config: { reRenderOnLangChange: true, prodMode: false },
        } as unknown as TranslocoService,
      },
      { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      { provide: AppPageTitle, useValue: { title: '' } },
    ],
  });
  // Same render cadence as habit-user-journeys: transloco's structural directive
  // resolves its scope in a microtask, so an ApplicationRef tick is needed before
  // the embedded view (and the cards) exist in the DOM.
  const appRef = TestBed.inject(ApplicationRef);
  const fixture = TestBed.createComponent(HabitListComponent);
  fixture.detectChanges();
  await flush();
  appRef.tick();
  fixture.detectChanges();
  return { fixture, service, snackbar, dialog };
}

function punchCardTitles(fixtureDom: HTMLElement): string[] {
  return Array.from(fixtureDom.querySelectorAll<HTMLElement>('.habit-card'))
    .filter((card) =>
      Array.from(card.querySelectorAll('button')).some((b) => norm(b.textContent).includes('habits.list.punch'))
    )
    .map((card) => norm(card.querySelector('mat-card-title')?.textContent));
}

describe('HabitListComponent — Punch button window', () => {
  it('shows Punch for active habits; only a future start (or inactivity) hides it', async () => {
    const { fixture } = await renderList([
      makeHabit({ id: 1, name: 'InWindow' }),
      // Ended yesterday but still active: back-fill keeps the button (FR-3.1).
      makeHabit({ id: 2, name: 'Ended', endDate: day(-1) }),
      makeHabit({ id: 3, name: 'Future', startDate: day(2) }),
      makeHabit({ id: 4, name: 'Inactive', state: 'inactive' }),
    ]);

    expect(punchCardTitles(fixture.nativeElement as HTMLElement)).toEqual(['InWindow', 'Ended']);
  });

  it('keeps Punch at the boundaries and for open-ended habits', async () => {
    const { fixture } = await renderList([
      makeHabit({ id: 1, name: 'EndsToday', endDate: todayIso() }),
      makeHabit({ id: 2, name: 'StartsToday', startDate: todayIso() }),
      makeHabit({ id: 3, name: 'EndedTodayMinus', endDate: day(-1) }),
    ]);

    expect(punchCardTitles(fixture.nativeElement as HTMLElement)).toEqual([
      'EndsToday',
      'StartsToday',
      'EndedTodayMinus',
    ]);
  });
});

describe('HabitListComponent — shares dialog', () => {
  it('opens the invitation dialog scoped to the habit', async () => {
    const { fixture, dialog } = await renderList([makeHabit({ id: 1, name: 'Run' })]);

    fixture.componentInstance.openShares(makeHabit({ id: 1, name: 'Run' }));

    expect(dialog.open).toHaveBeenCalledWith(
      HabitSharesDialogComponent,
      expect.objectContaining({ data: { habitId: 1, habitName: 'Run' } })
    );
  });

  it('every card carries the actions menu trigger (the shares entry lives in the menu portal)', async () => {
    const { fixture } = await renderList([makeHabit({ id: 1 }), makeHabit({ id: 2, state: 'inactive' })]);

    // MatMenu content is only rendered once opened, so assert the trigger instead —
    // the template holds the single Shares entry (no more state-dependent toggle).
    const triggers = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.habit-card button[aria-label="habits.list.actions"]'
    );
    expect(triggers.length).toBe(2);
  });
});
