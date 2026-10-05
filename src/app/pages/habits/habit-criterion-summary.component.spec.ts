import { TestBed } from '@angular/core/testing';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { HabitCriterionSummaryComponent } from './habit-criterion-summary.component';
import type { CriterionProgressOut } from './habit.models';

/** L12: composite operator chips must go through i18n, not the raw enum. */

const criteria: CriterionProgressOut[] = [
  {
    criterionId: 1,
    name: 'Run',
    isRoot: false,
    criterionType: 'condition',
    passed: true,
    propertyName: 'distance',
    aggregationMode: null,
    currentValue: 5,
    threshold: 4,
    successType: null,
    cycleTarget: null,
    currentDayValue: null,
    successfulDays: null,
    operator: null,
    operandIds: null,
  },
  {
    criterionId: 2,
    name: 'Lift',
    isRoot: false,
    criterionType: 'condition',
    passed: false,
    propertyName: 'reps',
    aggregationMode: null,
    currentValue: 1,
    threshold: 3,
    successType: null,
    cycleTarget: null,
    currentDayValue: null,
    successfulDays: null,
    operator: null,
    operandIds: null,
  },
  {
    criterionId: 3,
    name: 'Goal',
    isRoot: true,
    criterionType: 'composite',
    passed: false,
    propertyName: null,
    aggregationMode: null,
    currentValue: 1,
    threshold: 2,
    successType: 'daily',
    cycleTarget: 5,
    currentDayValue: null,
    successfulDays: null,
    operator: 'and',
    operandIds: [1, 2],
  },
];

describe('HabitCriterionSummaryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslocoService,
          useValue: {
            translate: vi.fn((key: string) => key),
            setActiveLang: vi.fn(),
            getActiveLang: vi.fn(),
            selectTranslate: vi.fn().mockReturnValue(of('')),
            // The *transloco structural directive loads deps per scope.
            _loadDependencies: vi.fn().mockReturnValue(of(null)),
            langChanges$: of('en'),
            events$: of(),
            activeLang: 'en',
            config: { reRenderOnLangChange: true, prodMode: false },
          } as unknown as TranslocoService,
        },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
      ],
    });
    await TestBed.compileComponents();
  });

  it('renders the composite operator through the habits.operator.* key (L12)', () => {
    const fixture = TestBed.createComponent(HabitCriterionSummaryComponent);
    fixture.componentRef.setInput('criteria', criteria);
    fixture.componentInstance.expanded.set(true);
    fixture.detectChanges();

    const op = fixture.nativeElement.querySelector('.summary-op');
    // The stubbed transloco echoes keys — the raw 'and' would prove the bug.
    expect(op.textContent.trim()).toBe('habits.operator.and');

    const transloco = TestBed.inject(TranslocoService) as unknown as { translate: ReturnType<typeof vi.fn> };
    const keys = transloco.translate.mock.calls.map((c: unknown[]) => c[0]);
    expect(keys).toContain('habits.operator.and');
  });

  it('shows the passing chip count', () => {
    const fixture = TestBed.createComponent(HabitCriterionSummaryComponent);
    fixture.componentRef.setInput('criteria', criteria);
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('.summary-chip');
    expect(chip.textContent.trim()).toBe('habits.summary.passing'); // key echoed, params interpolated by real transloco
  });
});
