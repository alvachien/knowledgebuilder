import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { HabitPunchEditDialogComponent } from './habit-punch-edit-dialog.component';
import type { PunchOut } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Punch-edit dialog tolerance: the API upserts same-day booleans into one
 * session, so an edited punch can arrive with an EMPTY values array — the
 * dialog must render a clear state and refuse a no-op save.
 */

function punch(values: PunchOut['values']): PunchOut {
  return {
    id: 11,
    habitId: 7,
    itemId: 3,
    punchedAt: '2026-09-21T08:00:00Z',
    punchDate: '2026-09-21',
    createdAt: '',
    values,
  };
}

async function create(punchData: PunchOut) {
  const service = { updatePunch: vi.fn(() => of(punchData)) };
  const close = vi.fn();
  await TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: MAT_DIALOG_DATA, useValue: { habitId: 7, itemId: 3, punch: punchData, perCyclePropertyIds: [] } },
      { provide: MatDialogRef, useValue: { close } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      {
        provide: TranslocoService,
        useValue: {
          translate: vi.fn((key: string) => key),
          setActiveLang: vi.fn(),
          getActiveLang: vi.fn(),
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
    ],
  });
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(HabitPunchEditDialogComponent);
  fixture.detectChanges();
  return { fixture, comp: fixture.componentInstance, service, close };
}

describe('HabitPunchEditDialogComponent', () => {
  it('renders an explicit hint and disables save for an empty values array', async () => {
    const { fixture, comp } = await create(punch([]));

    expect(comp.rows.length).toBe(0);
    const hint = fixture.nativeElement.querySelector('.empty-hint');
    expect(hint).not.toBeNull();
    expect(hint.textContent.trim()).toBe('habits.editPunch.emptyValues');
    const saveBtn = fixture.nativeElement.querySelectorAll('mat-dialog-actions button')[1] as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it('builds PUT values from the rows and closes saved', async () => {
    const full = punch([
      { propertyId: 5, propertyName: 'km', propertyType: 'numeric', boolValue: null, numValue: 12, listEntries: null },
      { propertyId: 6, propertyName: 'notes', propertyType: 'list', boolValue: null, numValue: null, listEntries: ['a', 'b'] },
    ]);
    const { comp, service, close } = await create(full);

    expect(comp.rows.length).toBe(2);
    await comp.save();

    expect(service.updatePunch).toHaveBeenCalledTimes(1);
    const [habitId, itemId, punchId, body] = service.updatePunch.mock.calls[0] as unknown as [
      number,
      number,
      number,
      { values: unknown[] },
    ];
    expect([habitId, itemId, punchId]).toEqual([7, 3, 11]);
    expect(body.values).toEqual([
      { propertyId: 5, numValue: 12 },
      { propertyId: 6, listEntries: ['a', 'b'] },
    ]);
    expect(close).toHaveBeenCalledWith('saved');
  });
});
