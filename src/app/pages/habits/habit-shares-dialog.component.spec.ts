import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { HabitSharesDialogComponent } from './habit-shares-dialog.component';
import type { ShareGrant, UserSearchHit } from './habit.models';
import { HabitApiError } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Invitation manager semantics: grants list on open, username search (≥2 chars,
 * debounced) feeds the invite picker, already-invited hits are detected, and add/
 * revoke round-trip to the Shares endpoints.
 */

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 350)); // beat the 300ms debounce

const makeGrant = (over: Partial<ShareGrant> = {}): ShareGrant => ({
  id: 1,
  granteeUserId: 'u-2',
  granteeUserName: 'Bob',
  createdAt: '2026-10-01T00:00:00Z',
  ...over,
});

const makeHit = (over: Partial<UserSearchHit> = {}): UserSearchHit => ({
  userId: 'u-2',
  userName: 'Bob',
  ...over,
});

async function createDialog(opts: { grants?: ShareGrant[]; hits?: UserSearchHit[]; addError?: unknown } = {}) {
  const service = {
    getShares: vi.fn(() => of(opts.grants ?? [])),
    addShare: vi.fn(() =>
      opts.addError ? throwError(() => opts.addError) : of(makeGrant())
    ),
    deleteShare: vi.fn(() => of(undefined as void)),
    searchUsers: vi.fn(() => of(opts.hits ?? [])),
  };
  const snackbar = { open: vi.fn() };
  const ref = { close: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      { provide: HabitService, useValue: service },
      { provide: MAT_DIALOG_DATA, useValue: { habitId: 7, habitName: 'Running' } },
      { provide: MatDialogRef, useValue: ref },
      { provide: MatSnackBar, useValue: snackbar },
      {
        provide: TranslocoService,
        useValue: {
          // Full stub — the render test instantiates the *transloco structural
          // directive, which calls _loadDependencies on resolveScope.
          translate: vi.fn((key: string, params?: Record<string, unknown>) =>
            params ? `${key}/${JSON.stringify(params)}` : key
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
    ],
  });
  const fixture = TestBed.createComponent(HabitSharesDialogComponent);
  return { comp: fixture.componentInstance, fixture, service, snackbar, ref };
}

describe('HabitSharesDialogComponent', () => {
  it('loads the current invites on open', async () => {
    const { comp, service } = await createDialog({ grants: [makeGrant()] });
    await flush();

    expect(service.getShares).toHaveBeenCalledWith(7);
    expect(comp.grants()).toHaveLength(1);
  });

  it('searches after the debounce only for 2+ characters', async () => {
    const { comp, service } = await createDialog({ hits: [makeHit()] });

    comp.onQueryChange('b');
    await settle();
    expect(service.searchUsers).not.toHaveBeenCalled();
    expect(comp.queryInvalid()).toBe(true);
    expect(comp.results()).toEqual([]);

    comp.onQueryChange('bo');
    await settle();
    expect(service.searchUsers).toHaveBeenCalledWith('bo');
    expect(comp.results()).toEqual([makeHit()]);
    expect(comp.queryInvalid()).toBe(false);
  });

  it('invites a search hit and re-reads the grant list', async () => {
    const { comp, service } = await createDialog();

    comp.invite(makeHit());
    await flush();

    expect(service.addShare).toHaveBeenCalledWith(7, 'u-2', 'Bob');
    expect(service.getShares).toHaveBeenCalledTimes(2);
  });

  it('detects already-invited hits and refuses to double-grant', async () => {
    const { comp, service } = await createDialog({ grants: [makeGrant()] });
    await flush();

    expect(comp.isAlreadyInvited(makeHit())).toBe(true);
    comp.invite(makeHit());
    await flush();
    expect(service.addShare).not.toHaveBeenCalled();
  });

  it('revokes a grant via the Shares endpoint', async () => {
    const { comp, service } = await createDialog();

    comp.remove(makeGrant({ id: 4 }));
    await flush();

    expect(service.deleteShare).toHaveBeenCalledWith(7, 4);
  });

  it('surfaces API errors through the shared error snackbar path', async () => {
    const { comp, service, snackbar } = await createDialog({
      addError: new HabitApiError('invalidGrantee', 'cannot invite yourself', 422),
    });

    comp.invite(makeHit());
    await flush();

    expect(snackbar.open).toHaveBeenCalled();
    // Failed invite stays retryable (busy flag released).
    expect(comp.busyUsers.size).toBe(0);
    expect(service.getShares).toHaveBeenCalledTimes(1);
  });

  it('renders the title, hint and current invites after CD settles', async () => {
    const { fixture } = await createDialog({ grants: [makeGrant({ granteeUserName: 'Bob' })] });
    const appRef = TestBed.inject(ApplicationRef);
    fixture.detectChanges();
    await flush();
    appRef.tick();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('habits.shares.title');
    expect(text).toContain('Bob');
  });
});
