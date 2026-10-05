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

import type { CriterionProgressOut, DayHistoryOut, HabitItem, SharedHabitDetail } from './habit.models';
import { HabitService } from './habit.service';
import { SharedHabitDetailComponent } from './shared-habit-detail.component';

/**
 * Read-only shared detail: owner credit, full punch values (the viewer sees what the
 * owner sees) — and the invariant that no write affordance (punch / edit / delete)
 * ever renders, only the day-grouped history.
 */

const root: CriterionProgressOut = {
  criterionId: 1,
  name: 'Goal',
  isRoot: true,
  criterionType: 'condition',
  passed: false,
  propertyName: 'word',
  aggregationMode: null,
  currentValue: 2,
  threshold: 10,
  successType: 'cumulative',
  cycleTarget: null,
  currentDayValue: null,
  successfulDays: null,
  operator: null,
  operandIds: null,
};

const habitDef = {
  id: 9,
  name: 'Vocabulary',
  description: 'daily words',
  cycle: 'daily' as const,
  startDate: '2026-09-01',
  endDate: null,
  state: 'active' as const,
  hasPunches: true,
  createdAt: '',
  progress: { cycleFrom: '2026-09-15', cycleTo: '2026-09-15', rootCriterion: root, criteria: [] },
};

const items: HabitItem[] = [
  {
    id: 3,
    habitId: 9,
    name: 'New words',
    order: 0,
    createdAt: '',
    hasPunches: true,
    properties: [
      {
        id: 5,
        itemId: 3,
        name: 'word',
        propertyType: 'list',
        baseRate: null,
        itemUniqueness: 'per_day',
        order: 0,
        createdAt: '',
        currentCycleValue: 2,
        todayValue: 2,
      },
    ],
  },
];

const days: DayHistoryOut[] = [
  {
    date: '2026-09-15',
    cycleFrom: '2026-09-15',
    cycleTo: '2026-09-15',
    isSuccessful: false,
    criteria: [],
    punches: [
      {
        id: 40,
        habitId: 9,
        itemId: 3,
        punchedAt: '2026-09-15T10:30:00Z',
        punchDate: '2026-09-15',
        createdAt: '',
        values: [
          { propertyId: 5, propertyName: 'word', propertyType: 'list', boolValue: null, numValue: null, listEntries: ['petrichor', 'sonder'] },
        ],
      },
    ],
  },
];

function makeDetail(over?: Partial<SharedHabitDetail>): SharedHabitDetail {
  return { habit: habitDef, ownerName: 'Alice', items, criteria: [], ...over };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

async function renderDetail(detail: SharedHabitDetail | 'error', history: DayHistoryOut[] = days) {
  const service = {
    getSharedHabit: vi.fn(() =>
      detail === 'error' ? throwError(() => new Error('404')) : of(detail)
    ),
    getSharedHistory: vi.fn(() => of(history)),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '9' : null) }, queryParamMap: { get: () => null } } } },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      {
        provide: TranslocoService,
        useValue: {
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
  const fixture = TestBed.createComponent(SharedHabitDetailComponent);
  fixture.detectChanges();
  await flush();
  appRef.tick();
  fixture.detectChanges();
  return { fixture, service };
}

describe('SharedHabitDetailComponent', () => {
  it('credits the owner and shows the read-only badge', async () => {
    const { fixture } = await renderDetail(makeDetail());
    const header = norm((fixture.nativeElement as HTMLElement).querySelector('.detail-header')?.textContent);
    expect(header).toContain('habits.shared.by/Alice');
    expect(header).toContain('habits.shared.readOnly');
  });

  it('renders items, the day-grouped history with FULL list values', async () => {
    const { fixture, service } = await renderDetail(makeDetail());
    const dom = fixture.nativeElement as HTMLElement;

    expect(norm(dom.textContent)).toContain('New words');
    expect(service.getSharedHistory).toHaveBeenCalled();

    const punch = dom.querySelector('.history-punch');
    expect(norm(punch?.textContent)).toContain('petrichor, sonder');
    expect(norm(punch?.textContent)).toContain('New words');
  });

  it('exposes NO write affordances — no punch button, no per-punch edit/delete', async () => {
    const { fixture } = await renderDetail(makeDetail());
    const dom = fixture.nativeElement as HTMLElement;

    expect(dom.querySelector('.history-punch button')).toBeNull();
    const texts = Array.from(dom.querySelectorAll('button')).map((b) => norm(b.textContent));
    expect(texts.some((t) => t.includes('habits.list.punch'))).toBe(false);
    expect(texts.some((t) => t.includes('habits.editPunch'))).toBe(false);
    expect(texts.some((t) => t.includes('habits.detail.deletePunch'))).toBe(false);
    // Only the history filter's Apply/Clear buttons exist:
    expect(texts.filter((t) => t === 'habits.detail.apply' || t === 'habits.detail.clear')).toHaveLength(2);
  });

  it('renders the generic not-found when the habit is (or became) unshared', async () => {
    const { fixture } = await renderDetail('error');
    expect(norm((fixture.nativeElement as HTMLElement).textContent)).toContain('habits.errors.notFound');
  });
});
