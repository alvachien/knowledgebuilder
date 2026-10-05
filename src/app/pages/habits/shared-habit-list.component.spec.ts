import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';

import type { CriterionProgressOut, Habit, SharedHabitSummary } from './habit.models';
import { HabitService } from './habit.service';
import { SharedHabitListComponent } from './shared-habit-list.component';

/**
 * Shared gallery (read-only): owner credit on every card and the defining
 * invariant — NO write affordances (no punch/edit/menu buttons) anywhere.
 */

const root: CriterionProgressOut = {
  criterionId: 1,
  name: 'Goal',
  isRoot: true,
  criterionType: 'condition',
  passed: true,
  propertyName: 'distance',
  aggregationMode: null,
  currentValue: 35,
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
    description: 'weekly target',
    cycle: 'weekly',
    startDate: '2026-09-01',
    endDate: null,
    state: 'active',
    hasPunches: true,
    createdAt: '',
    progress: { cycleFrom: '2026-09-14', cycleTo: '2026-09-20', rootCriterion: root, criteria: [] },
    ...over,
  };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

async function renderGallery(entries: SharedHabitSummary[] | 'error') {
  const service = {
    getSharedHabits: vi.fn(() =>
      entries === 'error' ? throwError(() => new Error('boom')) : of(entries)
    ),
  };
  const snackbar = { open: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      // RouterLink needs ActivatedRoute (v22 required dep); the shared tabs render inside.
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatSnackBar, useValue: snackbar },
      {
        provide: TranslocoService,
        useValue: {
          // Echo the key; interpolate {name} so owner credit is assertable.
          translate: vi.fn((key: string, params?: { name?: string }) =>
            params?.name ? `${key}/${params.name}` : key
          ),
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
  const appRef = TestBed.inject(ApplicationRef);
  const fixture = TestBed.createComponent(SharedHabitListComponent);
  fixture.detectChanges();
  await flush();
  appRef.tick();
  fixture.detectChanges();
  return { fixture, service, snackbar };
}

describe('SharedHabitListComponent', () => {
  it('renders one card per shared habit, credits the owner, offers NO write actions', async () => {
    const { fixture } = await renderGallery([
      { habit: makeHabit({ id: 1, name: 'Run' }), ownerName: 'Alice' },
      { habit: makeHabit({ id: 2, name: 'Read', state: 'inactive' }), ownerName: 'Bob' },
    ]);

    const dom = fixture.nativeElement as HTMLElement;
    const cards = dom.querySelectorAll('.shared-card');
    expect(cards.length).toBe(2);
    expect(norm(cards[0]?.textContent)).toContain('habits.shared.by/Alice');
    expect(norm(cards[1]?.textContent)).toContain('Bob');
    // Read-only gallery: zero buttons inside cards (no punch/edit/menu actions).
    expect(cards[0]?.querySelectorAll('button').length).toBe(0);
    expect(cards[1]?.querySelectorAll('button').length).toBe(0);
    // Progress bar renders from the embedded progress payload.
    expect(cards[0]?.querySelector('mat-progress-bar')).toBeTruthy();
  });

  it('shows the empty state when nothing is shared', async () => {
    const { fixture } = await renderGallery([]);
    const text = norm((fixture.nativeElement as HTMLElement).textContent);
    expect(text).toContain('habits.shared.empty');
  });

  it('offers retry after a failed load', async () => {
    const { fixture, service } = await renderGallery('error');
    const dom = fixture.nativeElement as HTMLElement;
    expect(norm(dom.textContent)).toContain('habits.shared.loadError');

    const retry = Array.from(dom.querySelectorAll('button')).find((b) =>
      norm(b.textContent).includes('habits.shared.retry')
    );
    expect(retry).toBeTruthy();
    retry?.click();
    await flush();
    expect(service.getSharedHabits).toHaveBeenCalledTimes(2);
  });
});
