import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError, forkJoin, map, of, Subject, switchMap } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { provideHabitDateLocale } from './habit-date-locale';
import { dateToIso, isoToDate, todayIso } from './habit-date.util';
import { showHabitError } from './habit-error-messages';
import { punchDateBounds } from './habit-window.util';
import type { DayHistoryOut, Habit, HabitItem, PropertyOut, PropertyValueCreate, PunchCreate } from './habit.models';
import { HabitService } from './habit.service';

/**
 * The day-value delta a buffered punch adds for one property value (review
 * L8d): the API's todayValue weights numeric inputs by the property's base
 * rate (`numValue × (baseRate ?? 1)`); list values count entries; booleans
 * set (not accumulate) the day value and never go through this path.
 */
export function todayValueDelta(baseRate: number | null, value: PropertyValueCreate): number {
  if (value.numValue !== null && value.numValue !== undefined) {
    return value.numValue * (baseRate ?? 1);
  }
  return value.listEntries?.length ?? 0;
}

export interface HabitPunchDialogData {
  habit: Habit;
  items: HabitItem[];
}

/**
 * Punch panel (FR-3.1): one expansion panel per item. Boolean properties auto-submit
 * on toggle (last write wins within the day); numeric/list inputs are buffered and
 * submitted together from the footer — one `POST .../Punches` per item with dirty
 * inputs. The Punch button always closes the dialog: with buffered values it submits
 * them first and closes once the batch settles — fully successful or not (failed
 * items are only reported via snackbar; retrying means reopening the dialog) — and
 * with nothing buffered it closes directly, returning `'saved'` when anything was
 * recorded this session (auto-submitted booleans) and `undefined` otherwise.
 * Close returns the same `'saved'`/`undefined` contract.
 *
 * A date picker at the top selects the day being punched (default: today; bounded to
 * the habit's active window, never future). Since the revised FR-3.1/3.3 the bounds
 * are `[startDate, min(endDate, today)]` for ANY active habit — an ended-but-not
 * deactivated period still back-fills its past days, so the initial selection clamps
 * to the last punchable day. Selecting a PAST day switches the panel onto a day
 * overlay: checkboxes/hints read that day's already-recorded values — fetched from
 * History and folded exactly like the server aggregates — and submits carry
 * `punchDate`. The today path keeps using the habit payload's `todayValue`
 * untouched (and sends no `punchDate`, which also sidesteps client/server clock
 * skew). Once any punch of this session has landed, the picker locks: auto-submitted
 * booleans are stamped with the date active when toggled, and a mid-session change
 * would mislabel them (delete + re-punch via history is the way to move a record).
 */
@Component({
  selector: 'app-habits-punch-dlg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslocoModule,
  ],
  // The dialog is created by MatDialog outside the opener's element injector —
  // the date-fns adapter + locale must be provided here (same pattern as the
  // wizard; locale follows the active Transloco language).
  providers: [provideDateFnsAdapter(), provideHabitDateLocale()],
  template: `
    <div *transloco="let t">
      <h2 mat-dialog-title>{{ t('habits.punch.title', { name: data.habit.name, date: selectedDate() }) }}</h2>
      <mat-dialog-content>
        <mat-form-field class="date-field" appearance="outline">
          <mat-label>{{ t('habits.punch.dateLabel') }}</mat-label>
          <input matInput [matDatepicker]="dayPicker" [min]="minDate()" [max]="maxDate()" [disabled]="dayLocked()" [ngModel]="punchDate()" (ngModelChange)="onDateChange($event)" />
          <mat-datepicker-toggle matIconSuffix [for]="dayPicker" [disabled]="dayLocked()"></mat-datepicker-toggle>
          <mat-datepicker #dayPicker></mat-datepicker>
        </mat-form-field>
        <mat-accordion multi>
          @for (item of data.items; track item.id; let first = $first) {
            <mat-expansion-panel [expanded]="first">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon class="panel-icon" [class.punched]="punchedItems.has(item.id)" [class.today]="hasValueOnDay(item)">
                    {{ punchedItems.has(item.id) ? 'check_circle' : hasValueOnDay(item) ? 'radio_button_checked' : 'radio_button_unchecked' }}
                  </mat-icon>
                  {{ item.name }}
                </mat-panel-title>
              </mat-expansion-panel-header>

              @for (p of item.properties; track p.id) {
                @switch (p.propertyType) {
                  @case ('boolean') {
                    <mat-checkbox
                      [checked]="boolState[p.id] ?? dayValue(p) === 1"
                      (change)="onBooleanChange(item, p, $event.checked)">
                      {{ p.name }}
                    </mat-checkbox>
                  }
                  @case ('numeric') {
                    <mat-form-field class="ctrl-field" appearance="outline">
                      <mat-label>{{ p.name }}</mat-label>
                      <input matInput type="number" min="0.01" step="any" [(ngModel)]="numInputs[p.id]" (ngModelChange)="markDirty()" />
                      @if (dayValue(p) !== null) {
                        <mat-hint>{{ dayHint(p) }}</mat-hint>
                      }
                    </mat-form-field>
                  }
                  @default {
                    <mat-form-field class="ctrl-field" appearance="outline">
                      <mat-label>{{ p.name }}</mat-label>
                      <textarea matInput rows="2" [(ngModel)]="listInputs[p.id]" (ngModelChange)="markDirty()"></textarea>
                      <mat-hint>{{ t('habits.punch.onePerLine') }}</mat-hint>
                      @if (dayValue(p) !== null) {
                        <mat-hint align="end">{{ dayHint(p) }}</mat-hint>
                      }
                    </mat-form-field>
                  }
                }
              }
            </mat-expansion-panel>
          }
        </mat-accordion>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">{{ t('close') }}</button>
        <button mat-raised-button color="primary" (click)="submitBuffered()">
          {{ t('habits.punch.punchButton') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      /* Material caps mat-dialog-content at 65vh — with the date field added and
         several panels expanded the accordion was squeezed into a sliver. The
         component-scoped rule (class + ngcontent attr) out-ranks the library one.
         200px ≈ the M3 chrome that must stay visible outside the scroll area
         (title + actions + surface padding + overlay gutter), leaving the
         content as tall as the viewport allows. */
      mat-dialog-content { max-height: calc(100vh - 200px); }
      .date-field { width: 100%; margin-bottom: 4px; }
      .ctrl-field { width: 100%; margin-bottom: 4px; }
      .panel-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; vertical-align: middle; margin-right: 6px; }
      .panel-icon.punched { color: var(--green, #2e7d32); }
      .panel-icon.today { color: var(--blue, #1565c0); }
      mat-checkbox { display: block; margin: 6px 0; }
    `,
  ],
})
export class HabitPunchDialogComponent {
  readonly dialogRef = inject(MatDialogRef<HabitPunchDialogComponent>);
  readonly data = inject<HabitPunchDialogData>(MAT_DIALOG_DATA);

  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  /** Local mirror of same-day boolean state (checkbox source of truth after auto-submit). */
  readonly boolState: Record<number, boolean> = {};
  readonly numInputs: Record<number, number | null> = {};
  readonly listInputs: Record<number, string> = {};

  readonly punchedItems = new Set<number>();
  readonly dirty = signal(false);
  private anyPunched = false;

  /** The date picker locks after the first successful punch of this session. */
  readonly dayLocked = signal(false);

  // ── Selected day + day overlay ────────────────────────────────────────────────

  /** `yyyy-MM-dd` being punched; defaults to the browser-local today. */
  readonly selectedDate = signal(todayIso());
  readonly punchDate = signal<Date>(new Date());

  /**
   * Per-property values for a SELECTED PAST day (null ⇒ the today path, which reads
   * and writes `PropertyOut.todayValue` exactly as before). Records are replaced
   * wholesale — OnPush never sees in-place mutation.
   */
  readonly dayState = signal<Record<number, number | null> | null>(null);

  private readonly dayLoad$ = new Subject<string>();
  /** Guards against a slow past-day fetch landing after the user moved on. */
  private dayGen = 0;

  readonly minDate = signal<Date | null>(null);
  readonly maxDate = signal<Date | null>(null);

  constructor() {
    const bounds = punchDateBounds(this.data.habit);
    const initial = bounds ? this.clampToBounds(new Date(), bounds.min, bounds.max) : new Date();
    this.punchDate.set(initial);
    this.selectedDate.set(dateToIso(initial));
    if (bounds) {
      this.minDate.set(isoToDate(bounds.min));
      this.maxDate.set(isoToDate(bounds.max));
    }

    this.dayLoad$
      .pipe(
        switchMap((iso) => {
          const gen = ++this.dayGen;
          return this.service.getHistory(this.data.habit.id, iso, iso).pipe(
            map((days) => ({ gen, days })),
            catchError((err: unknown) => {
              showHabitError(this.snackbar, this.transloco, err);
              return of<{ gen: number; days: DayHistoryOut[] }>({ gen, days: [] });
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ gen, days }) => {
        if (gen === this.dayGen) {
          this.dayState.set(this.foldDay(days));
        }
      });

    // An ended-but-active period clamps the default selection to the LAST
    // in-window day — that is a past day, so load its overlay right away
    // (after the subscription exists, otherwise the panel would read
    // today's values for a back-fill date).
    if (this.selectedDate() !== todayIso()) {
      this.dayState.set({});
      this.dayLoad$.next(this.selectedDate());
    }
  }

  private clampToBounds(d: Date, minIso: string, maxIso: string): Date {
    const iso = dateToIso(d);
    if (iso < minIso) {
      return isoToDate(minIso);
    }
    if (iso > maxIso) {
      return isoToDate(maxIso);
    }
    return d;
  }

  private isTodaySelected(): boolean {
    return this.selectedDate() === todayIso();
  }

  /**
   * The selected day's recorded value for a property. With the today overlay
   * active (null state) this is `todayValue`; for a PAST day the overlay shadows
   * it COMPLETELY — a property missing from the overlay has nothing recorded on
   * that day (null), even when today has a value.
   */
  dayValue(p: PropertyOut): number | null {
    const state = this.dayState();
    return state ? (state[p.id] ?? null) : p.todayValue;
  }

  hasValueOnDay(item: HabitItem): boolean {
    return item.properties.some((p) => this.dayValue(p) !== null);
  }

  dayHint(p: PropertyOut): string {
    const value = this.dayValue(p);
    if (this.isTodaySelected()) {
      return this.transloco.translate('habits.punch.today', { value });
    }
    return this.transloco.translate('habits.punch.dayValue', { date: this.selectedDate(), value });
  }

  onDateChange(date: Date | null): void {
    if (this.dayLocked() || !date) {
      return; // locked after the first landed punch; a cleared picker keeps the last selection
    }
    const iso = dateToIso(date);
    if (iso === this.selectedDate()) {
      return;
    }
    this.punchDate.set(date);
    this.selectedDate.set(iso);
    this.clearBuffered();

    if (iso === todayIso()) {
      ++this.dayGen; // cancel any in-flight past-day fold
      this.dayState.set(null); // today path re-reads p.todayValue
      return;
    }
    this.dayState.set({}); // empty overlay until the fetch lands (no stale-day flicker)
    this.dayLoad$.next(iso);
  }

  /** Buffered inputs belong to the day they were typed for — never migrate them. */
  private clearBuffered(): void {
    for (const key of Object.keys(this.numInputs)) {
      delete this.numInputs[Number(key)];
    }
    for (const key of Object.keys(this.listInputs)) {
      delete this.listInputs[Number(key)];
    }
    for (const key of Object.keys(this.boolState)) {
      delete this.boolState[Number(key)];
    }
    this.dirty.set(false);
  }

  /**
   * Fold one day's punch values into the overlay, mirroring the server's aggregation:
   * boolean = any true → 1 (0 when only false rows), numeric = Σ weighted by baseRate,
   * list = entry count. Inputs are deliberately NOT prefilled — re-submitting numeric
   * ADDS a session and re-submitting a list entry 422s `duplicateEntry`.
   */
  private foldDay(days: DayHistoryOut[]): Record<number, number | null> {
    const out: Record<number, number | null> = {};
    const props = new Map<number, PropertyOut>();
    for (const item of this.data.items) {
      for (const p of item.properties) {
        props.set(p.id, p);
      }
    }
    for (const punch of days.flatMap((d) => d.punches)) {
      for (const v of punch.values) {
        const prop = props.get(v.propertyId);
        if (!prop) {
          continue;
        }
        if (v.propertyType === 'boolean') {
          const val = v.boolValue ? 1 : 0;
          out[v.propertyId] = out[v.propertyId] === undefined ? val : Math.max(out[v.propertyId] ?? 0, val);
        } else if (v.propertyType === 'numeric') {
          out[v.propertyId] = (out[v.propertyId] ?? 0) + todayValueDelta(prop.baseRate, { propertyId: v.propertyId, numValue: v.numValue });
        } else {
          out[v.propertyId] = (out[v.propertyId] ?? 0) + todayValueDelta(prop.baseRate, { propertyId: v.propertyId, listEntries: v.listEntries });
        }
      }
    }
    return out;
  }

  /** Past-day submits carry `punchDate`; today keeps the exact legacy body (no field at all). */
  private punchBody(values: PropertyValueCreate[]): PunchCreate {
    const body: PunchCreate = { values };
    if (!this.isTodaySelected()) {
      body.punchDate = this.selectedDate();
    }
    return body;
  }

  markDirty(): void {
    this.dirty.set(true);
  }

  onBooleanChange(item: HabitItem, property: PropertyOut, checked: boolean): void {
    // Setting false when nothing was recorded on the punched day is a no-op (FR / design doc).
    if (!checked && this.dayValue(property) === null) {
      this.boolState[property.id] = false;
      return;
    }
    this.anyPunched = true;
    void this.submit(item, [{ propertyId: property.id, boolValue: checked }], checked);
  }

  submitBuffered(): void {
    const calls: { item: HabitItem; values: PropertyValueCreate[] }[] = [];
    for (const item of this.data.items) {
      const values: PropertyValueCreate[] = [];
      for (const p of item.properties) {
        const buffered = this.numInputs[p.id];
        if (p.propertyType === 'numeric' && buffered !== null && buffered !== undefined && buffered > 0) {
          values.push({ propertyId: p.id, numValue: buffered });
        }
        if (p.propertyType === 'list' && this.listInputs[p.id]?.trim()) {
          const entries = this.parseEntries(this.listInputs[p.id]);
          if (entries.length > 0) {
            values.push({ propertyId: p.id, listEntries: entries });
          }
        }
      }
      if (values.length > 0) {
        calls.push({ item, values });
      }
    }
    if (calls.length === 0) {
      // Nothing buffered (boolean-only habits auto-submit on toggle, or the
      // inputs were cleared again): Punch acts as a plain confirm-and-close —
      // 'saved' so the opener refreshes when this session recorded anything.
      this.dialogRef.close(this.anyPunched ? 'saved' : undefined);
      return;
    }

    this.anyPunched = true;
    // Per-call results instead of an all-or-nothing forkJoin: partial failures
    // persist the items that landed, so we must know WHICH ones to mark punched
    // and fold into the day value (review L8b); the failed ones are named in the
    // snackbar the user sees after the dialog closes.
    forkJoin(
      calls.map((c) =>
        this.service.createPunch(this.data.habit.id, c.item.id, this.punchBody(c.values)).pipe(
          map(() => ({ call: c, ok: true })),
          catchError(() => of({ call: c, ok: false })),
        )
      )
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        const failedNames: string[] = [];
        for (const r of results) {
          if (!r.ok) {
            failedNames.push(r.call.item.name);
            continue;
          }
          this.punchedItems.add(r.call.item.id);
          this.dayLocked.set(true);
          for (const v of r.call.values) {
            delete this.numInputs[v.propertyId];
            delete this.listInputs[v.propertyId];
            this.refreshDayValue(r.call.item, v);
          }
        }
        if (failedNames.length > 0) {
          this.snackbar.open(
            this.transloco.translate('habits.punch.partialFailure', { items: failedNames.join(', ') }),
            undefined,
            { duration: 6000, panelClass: ['habit-error-snackbar'] }
          );
        }
        // The Punch click closes the dialog once the batch settles, success or
        // not — a failure surfaces only through the snackbar (which outlives the
        // close), and retrying happens by reopening. 'saved' makes the opener
        // refetch so it shows exactly what landed server-side.
        this.dirty.set(false);
        this.dialogRef.close('saved');
      });
  }

  close(): void {
    this.dialogRef.close(this.anyPunched ? 'saved' : undefined);
  }

  private submit(item: HabitItem, values: PropertyValueCreate[], boolValue: boolean): Promise<void> {
    const propertyId = values[0].propertyId;
    const prop = item.properties.find((p) => p.id === propertyId);
    // Snapshot BEFORE the optimistic write so a failure restores the exact
    // previous day value (review L8c — the old conditional kept the 1).
    const overlay = this.dayState();
    const previousDayValue = overlay ? (overlay[propertyId] ?? null) : (prop?.todayValue ?? null);
    this.boolState[propertyId] = boolValue;
    this.punchedItems.add(item.id);
    if (overlay) {
      this.dayState.set({ ...overlay, [propertyId]: boolValue ? 1 : 0 });
    } else if (prop) {
      prop.todayValue = boolValue ? 1 : 0;
    }
    return (async (): Promise<void> => {
      try {
        await firstValueFrom(this.service.createPunch(this.data.habit.id, item.id, this.punchBody(values)));
        this.dayLocked.set(true);
      } catch (err: unknown) {
        showHabitError(this.snackbar, this.transloco, err);
        // Roll the optimistic flag and day value back on failure.
        this.boolState[propertyId] = !boolValue;
        const current = this.dayState();
        if (current) {
          this.dayState.set({ ...current, [propertyId]: previousDayValue });
        } else if (prop) {
          prop.todayValue = previousDayValue;
        }
      }
    })();
  }

  private refreshDayValue(item: HabitItem, value: PropertyValueCreate): void {
    const prop = item.properties.find((p) => p.id === value.propertyId);
    if (!prop) {
      return;
    }
    const delta = todayValueDelta(prop.baseRate, value);
    const overlay = this.dayState();
    if (overlay) {
      this.dayState.set({ ...overlay, [prop.id]: (overlay[prop.id] ?? 0) + delta });
    } else {
      prop.todayValue = (prop.todayValue ?? 0) + delta;
    }
  }

  private parseEntries(text: string): string[] {
    return text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
}
