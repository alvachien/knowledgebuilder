import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDateFnsModule, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError, firstValueFrom, of, Subject, switchMap } from 'rxjs';

import { AppPageTitle } from '../page-title/page-title';

import { HabitCriterionSummaryComponent } from './habit-criterion-summary.component';
import { provideHabitDateLocale } from './habit-date-locale';
import { dateToIso, isoToDate, normalizeDateRange, todayIso } from './habit-date.util';
import { showHabitError } from './habit-error-messages';
import type { DayHistoryOut, Habit, PunchOut, SharedHabitDetail } from './habit.models';
import { HabitService } from './habit.service';

/**
 * Read-only view of a shared habit (FR-6 relaxation): metadata, live cycle progress,
 * per-item values and the FULL punch history — same day-grouped rendering as the
 * owner's detail page, minus every write affordance (no punch/edit/delete). The
 * owner is credited by their display-name snapshot only; navigating here for an
 * unshared habit renders the generic not-found (the API never reveals existence).
 */
@Component({
  selector: 'app-shared-habit-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-main-content' },
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatDateFnsModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TranslocoModule,
    HabitCriterionSummaryComponent,
  ],
  // Same date-fns locale plumbing as the owner detail (adapter must be provided at
  // the component level for routed pages too; locale follows the active Transloco
  // language — en → enUS, zh → zhCN).
  providers: [provideDateFnsAdapter(), provideHabitDateLocale()],
  template: `
    <div *transloco="let t" class="shared-detail app-page-container">
      @if (loading()) {
        <div class="detail-loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
      } @else if (detail(); as d) {
        @let h = d.habit;
        @let rootCriterion = root(h);

        <div class="detail-header">
          <a mat-icon-button routerLink="/habits/shared" [attr.aria-label]="t('habits.shared.detailBack')">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="detail-title">{{ h.name }}</h1>
          <span class="shared-owner">
            <mat-icon class="owner-icon">person</mat-icon>
            {{ t('habits.shared.by', { name: d.ownerName }) }}
          </span>
          <span class="shared-readonly"><mat-icon>visibility</mat-icon> {{ t('habits.shared.readOnly') }}</span>
          <span class="detail-spacer"></span>
          @if (h.state !== 'active') {
            <span class="habit-state inactive">{{ t('habits.list.stateInactive') }}</span>
          }
        </div>

        @if (h.description) {
          <p class="detail-desc">{{ h.description }}</p>
        }

        <div class="detail-meta">
          <span>{{ t('habits.cycle.' + h.cycle) }}</span>
          <mat-divider type="vertical" [inset]="true"></mat-divider>
          <span>{{ t('habits.detail.started') }} {{ h.startDate }}</span>
          @if (h.endDate) {
            <mat-divider type="vertical" [inset]="true"></mat-divider>
            <span>{{ t('habits.detail.ends') }} {{ h.endDate }}</span>
          }
          <mat-divider type="vertical" [inset]="true"></mat-divider>
          <span>
            {{ t('habits.detail.window') }}: {{ h.progress.cycleFrom }} →
            {{ h.progress.cycleTo ?? t('habits.detail.ongoing') }}
          </span>
        </div>

        @if (serverTodayDiffers()) {
          <div class="detail-tz-hint">
            <mat-icon>schedule</mat-icon> {{ t('habits.detail.tzHint') }}
          </div>
        }

        <mat-card appearance="outlined" class="detail-progress-card">
          <mat-card-content>
            <div class="habit-progress">
              <span class="habit-progress-label">
                @if (isDaily()) {
                  {{ rootCriterion.successfulDays ?? 0 }} / {{ fmt(rootCriterion.cycleTarget) }} {{ t('habits.list.days') }}
                } @else {
                  {{ fmt(rootCriterion.currentValue) }} / {{ fmt(rootCriterion.threshold) }}
                }
              </span>
              @if (rootCriterion.passed) {
                <span class="habit-pass"><mat-icon>verified</mat-icon> {{ t('habits.list.passed') }}</span>
              }
              <mat-progress-bar
                mode="determinate"
                [value]="progressPercent()"
                [color]="rootCriterion.passed ? 'accent' : 'primary'"></mat-progress-bar>
            </div>

            @if (h.progress.criteria.length > 1) {
              <app-habit-criterion-summary [criteria]="h.progress.criteria" />
            }
          </mat-card-content>
        </mat-card>

        <h2 class="detail-section-title">{{ t('habits.detail.items') }}</h2>
        <mat-card appearance="outlined">
          <mat-card-content>
            @for (item of items(); track item.id) {
              <div class="detail-item">
                <div class="detail-item-name">{{ item.name }}</div>
                @for (prop of item.properties; track prop.id) {
                  <div class="detail-item-prop">
                    <span class="prop-name">{{ prop.name }}</span>
                    <span class="prop-value">
                      {{ t('habits.detail.cycleValue') }}: {{ fmt(prop.currentCycleValue) }}
                      · {{ t('habits.detail.todayValue') }}: {{ prop.todayValue === null ? '—' : fmt(prop.todayValue) }}
                    </span>
                  </div>
                }
              </div>
            } @empty {
              <p class="detail-history-empty">{{ t('habits.detail.noItems') }}</p>
            }
          </mat-card-content>
        </mat-card>

        <h2 class="detail-section-title">{{ t('habits.detail.history') }}</h2>

        <div class="detail-filter">
          <mat-form-field appearance="outline">
            <mat-label>{{ t('habits.detail.rangeFrom') }}</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate" />
            <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ t('habits.detail.rangeTo') }}</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate" />
            <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>
          <button mat-stroked-button (click)="applyFilter()">{{ t('habits.detail.apply') }}</button>
          <button mat-button (click)="clearFilter()">{{ t('habits.detail.clear') }}</button>
        </div>

        @if (history().length === 0) {
          <p class="detail-history-empty">{{ t('habits.detail.noHistory') }}</p>
        } @else {
          <mat-accordion multi class="detail-history">
            @for (day of history(); track day.date) {
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <span class="history-date">{{ day.date }}</span>
                  @if (showChipFor(day)) {
                    <span class="history-chip" [class.passed]="day.isSuccessful">
                      <mat-icon>{{ day.isSuccessful ? 'verified' : 'cancel' }}</mat-icon>
                      {{ chipLabel() }}
                    </span>
                  }
                </mat-expansion-panel-header>

                @for (criterion of day.criteria; track criterion.criterionId) {
                  <div class="history-criterion">
                    <mat-icon [class.crit-pass]="criterion.passed">
                      {{ criterion.passed ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                    <span class="crit-name">{{ criterion.name }}</span>
                    <span class="crit-value">{{ fmt(criterion.currentValue) }}</span>
                  </div>
                }

                <mat-divider></mat-divider>
                @if (day.punches.length === 0) {
                  <p class="detail-history-empty">{{ t('habits.detail.noPunchesDay') }}</p>
                }
                @for (punch of day.punches; track punch.id) {
                  <div class="history-punch">
                    <span class="punch-item">{{ itemOf(punch.itemId) }}</span>
                    <span class="punch-values">
                      @for (value of punch.values; track value.propertyId) {
                        <span class="punch-value">{{ value.propertyName }}: {{ valueText(value) }}</span>
                      }
                    </span>
                    <span class="punch-time">{{ punch.punchedAt | date: 'HH:mm' }}</span>
                  </div>
                }
              </mat-expansion-panel>
            }
          </mat-accordion>
        }
      } @else {
        <div class="detail-empty">
          <p>{{ t('habits.errors.notFound') }}</p>
          <a mat-stroked-button routerLink="/habits/shared">
            <mat-icon>arrow_back</mat-icon> {{ t('habits.shared.detailBack') }}
          </a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .shared-detail { padding-block: 16px; max-width: 960px; }
      .detail-loading, .detail-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 0; }
      .detail-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
      .detail-title { margin: 0; font-size: 1.4rem; }
      .detail-spacer { flex: 1 1 auto; }
      .shared-owner { display: inline-flex; align-items: center; font-weight: 600; }
      .owner-icon { font-size: 1rem; width: 1rem; height: 1rem; margin-right: 2px; }
      .shared-readonly {
        display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; opacity: 0.65;
      }
      .shared-readonly mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
      .detail-desc { margin: 0 0 8px; opacity: 0.85; }
      .detail-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px; }
      .habit-state { font-weight: 600; }
      .habit-state.inactive { opacity: 0.6; }
      .detail-tz-hint {
        display: flex; align-items: center; gap: 6px; margin: 8px 0; padding: 8px 12px;
        border-radius: 8px; background: rgba(255, 152, 0, 0.12); font-size: 0.85rem;
      }
      .detail-progress-card { margin-bottom: 16px; }
      .habit-progress { display: flex; flex-direction: column; gap: 4px; }
      .habit-progress-label { font-variant-numeric: tabular-nums; font-weight: 600; }
      .habit-pass { display: inline-flex; align-items: center; gap: 4px; color: var(--green, #2e7d32); }
      .detail-section-title { font-size: 1.05rem; margin: 20px 0 8px; }
      .detail-item { padding: 8px 0; }
      .detail-item + .detail-item { border-top: 1px solid rgba(128, 128, 128, 0.2); }
      .detail-item-name { font-weight: 600; }
      .detail-item-prop { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 0.85rem; padding-left: 12px; }
      .prop-name { opacity: 0.9; }
      .prop-value { font-variant-numeric: tabular-nums; opacity: 0.75; }
      .detail-filter { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
      .detail-filter mat-form-field { width: 180px; }
      .detail-history-empty { opacity: 0.7; padding: 12px 0; }
      .detail-history .history-date { font-weight: 600; font-variant-numeric: tabular-nums; }
      .detail-history .history-chip {
        display: inline-flex; align-items: center; gap: 4px; margin-left: 12px; padding: 2px 10px;
        border-radius: 12px; font-size: 0.75rem; background: rgba(128, 128, 128, 0.15);
      }
      .detail-history .history-chip.passed { background: rgba(46, 125, 50, 0.12); color: var(--green, #2e7d32); }
      .detail-history .history-chip mat-icon { font-size: 14px; width: 14px; height: 14px; }
      .detail-history .history-criterion { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 0.9rem; }
      .detail-history .crit-name { flex: 1 1 auto; }
      .detail-history .crit-value { font-variant-numeric: tabular-nums; opacity: 0.8; }
      .detail-history .crit-pass { color: var(--green, #2e7d32); }
      .detail-history .history-punch { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 6px 0; }
      .detail-history .punch-item { font-weight: 600; min-width: 120px; }
      .detail-history .punch-values { flex: 1 1 auto; display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.85rem; opacity: 0.85; }
      .detail-history .punch-time { font-size: 0.75rem; opacity: 0.6; font-variant-numeric: tabular-nums; }
      .detail-history mat-expansion-panel { margin-bottom: 8px; }
    `,
  ],
})
export class SharedHabitDetailComponent {
  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly pageTitle = inject(AppPageTitle);
  private readonly destroyRef = inject(DestroyRef);

  readonly detail = signal<SharedHabitDetail | null>(null);
  readonly history = signal<DayHistoryOut[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  fromDate: Date | null = null;
  toDate: Date | null = null;

  /** Subject+switchMap so rapid Apply clicks can never render a stale response. */
  private readonly historyFilter$ = new Subject<void>();

  constructor() {
    this.pageTitle.title = this.transloco.translate('habits.shared.title');
    this.historyFilter$
      .pipe(
        switchMap(() => {
          const { from, to } = normalizeDateRange(
            this.fromDate ? dateToIso(this.fromDate) : undefined,
            this.toDate ? dateToIso(this.toDate) : undefined
          );
          return this.service.getSharedHistory(this.id, from, to).pipe(
            catchError((err: unknown) => {
              showHabitError(this.snackbar, this.transloco, err);
              return of<DayHistoryOut[] | null>(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((days) => {
        if (days !== null) {
          this.history.set(days);
        }
      });
    void this.loadAll();
  }

  get id(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  items() {
    return this.detail()?.items ?? [];
  }

  root(habit: Habit) {
    return habit.progress.rootCriterion;
  }

  isDaily(): boolean {
    const d = this.detail();
    return d !== null && this.root(d.habit).successType === 'daily';
  }

  progressPercent(): number {
    const d = this.detail();
    if (!d) {
      return 0;
    }
    const r = this.root(d.habit);
    const goal = this.isDaily() ? (r.cycleTarget ?? 1) : (r.threshold ?? 1);
    const current = this.isDaily() ? (r.successfulDays ?? 0) : (r.currentValue ?? 0);
    return Math.min(100, Math.round((current / goal) * 100));
  }

  fmt(value: number | null): string {
    return value === null ? '—' : `${Math.round(value * 100) / 100}`;
  }

  serverTodayDiffers(): boolean {
    const d = this.detail();
    if (!d || d.habit.state !== 'active') {
      return false;
    }
    const local = todayIso();
    const withinWindow = local >= d.habit.startDate && (d.habit.endDate === null || local <= d.habit.endDate);
    return withinWindow && this.isDaily() && this.root(d.habit).currentDayValue === null;
  }

  /** Cumulative mode: the "cycle complete" chip renders only on the first passing day. */
  showChipFor(day: DayHistoryOut): boolean {
    if (!day.isSuccessful) {
      return false;
    }
    if (this.isDaily()) {
      return true;
    }
    const ascending = [...this.history()].sort((a, b) => a.date.localeCompare(b.date));
    return ascending.find((x) => x.isSuccessful)?.date === day.date;
  }

  chipLabel(): string {
    return this.isDaily()
      ? this.transloco.translate('habits.detail.dayPassed')
      : this.transloco.translate('habits.detail.cycleComplete');
  }

  itemOf(itemId: number): string {
    return this.items().find((i) => i.id === itemId)?.name ?? `#${itemId}`;
  }

  valueText(value: PunchOut['values'][number]): string {
    switch (value.propertyType) {
      case 'boolean':
        return value.boolValue ? '✓' : '✗';
      case 'numeric':
        return `${value.numValue ?? ''}`;
      default:
        return (value.listEntries ?? []).join(', ');
    }
  }

  applyFilter(): void {
    this.historyFilter$.next();
  }

  clearFilter(): void {
    this.fromDate = null;
    this.toDate = null;
    this.historyFilter$.next();
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    try {
      const detail = await firstValueFrom(this.service.getSharedHabit(this.id));
      this.detail.set(detail);

      // Default range: current cycle clamped to the habit's active window
      // (open-ended whole cycle leaves the upper bound unset).
      if (this.fromDate === null && this.toDate === null) {
        const h = detail.habit;
        const start = h.startDate > h.progress.cycleFrom ? h.startDate : h.progress.cycleFrom;
        this.fromDate = isoToDate(start);
        if (h.progress.cycleTo !== null) {
          const end = h.endDate && h.endDate < h.progress.cycleTo ? h.endDate : h.progress.cycleTo;
          this.toDate = isoToDate(end);
        }
      }
      this.historyFilter$.next();
    } catch (err) {
      this.notFound.set(true);
      showHabitError(this.snackbar, this.transloco, err);
    } finally {
      this.loading.set(false);
    }
  }
}
