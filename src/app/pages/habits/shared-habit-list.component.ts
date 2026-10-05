import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { AppPageTitle } from '../page-title/page-title';

import { HabitCriterionSummaryComponent } from './habit-criterion-summary.component';
import { showHabitError } from './habit-error-messages';
import { HabitPageHeaderComponent } from './habit-page-header.component';
import type { Habit, SharedHabitSummary } from './habit.models';
import { HabitService } from './habit.service';

/**
 * "Shared with me" — read-only gallery of the habits the CALLER was invited to
 * (FR-6 exception limited to named invitees), credited with the owner's display name.
 * Cards mirror the owner's list minus ALL write actions — no punch/edit/menu; clicking
 * opens the shared detail. A revoked invitation disappears on the next load (the API
 * joins the grants live).
 */
@Component({
  selector: 'app-shared-habit-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-main-content' },
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TranslocoModule,
    HabitCriterionSummaryComponent,
    HabitPageHeaderComponent,
  ],
  template: `
    <div *transloco="let t" class="shared-page app-page-container">
      <div class="shared-header">
        <h1 class="shared-title"><mat-icon>groups</mat-icon> {{ t('habits.shared.title') }}</h1>
        <app-habit-page-header page="shared" />
      </div>

      @if (loading()) {
        <div class="shared-loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
      } @else if (loadFailed()) {
        <div class="shared-empty">
          <p>{{ t('habits.shared.loadError') }}</p>
          <button mat-stroked-button (click)="load()"><mat-icon>refresh</mat-icon> {{ t('habits.shared.retry') }}</button>
        </div>
      } @else if (shared().length === 0) {
        <div class="shared-empty">
          <p>{{ t('habits.shared.empty') }}</p>
        </div>
      } @else {
        <div class="shared-grid">
          @for (entry of shared(); track entry.habit.id) {
            <mat-card appearance="outlined" class="shared-card" [routerLink]="['./', entry.habit.id]">
              <mat-card-header>
                <mat-card-title>{{ entry.habit.name }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="shared-owner">
                    <mat-icon class="owner-icon">person</mat-icon>
                    {{ t('habits.shared.by', { name: entry.ownerName }) }}
                  </span>
                  · <span class="habit-state" [class.inactive]="entry.habit.state === 'inactive'">
                    {{ entry.habit.state === 'active' ? t('habits.list.stateActive') : t('habits.list.stateInactive') }}
                  </span>
                  · {{ t('habits.cycle.' + entry.habit.cycle) }}
                  · {{ entry.habit.startDate }} → {{ entry.habit.endDate ?? '—' }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (entry.habit.description) {
                  <p class="shared-desc">{{ entry.habit.description }}</p>
                }
                <div class="habit-progress">
                  <span class="habit-progress-label">
                    @if (isDaily(entry.habit)) {
                      {{ root(entry.habit).successfulDays ?? 0 }} / {{ fmt(root(entry.habit).cycleTarget) }} {{ t('habits.list.days') }}
                    } @else {
                      {{ fmt(root(entry.habit).currentValue) }} / {{ fmt(root(entry.habit).threshold) }}
                    }
                  </span>
                  @if (root(entry.habit).passed) {
                    <span class="habit-pass"><mat-icon>verified</mat-icon> {{ t('habits.list.passed') }}</span>
                  }
                  <mat-progress-bar
                    mode="determinate"
                    [value]="progressPercent(entry.habit)"
                    [color]="root(entry.habit).passed ? 'accent' : 'primary'"></mat-progress-bar>
                </div>
                @if (entry.habit.progress.criteria.length > 1) {
                  <app-habit-criterion-summary [criteria]="entry.habit.progress.criteria" />
                }
                <span class="shared-readonly"><mat-icon>visibility</mat-icon> {{ t('habits.shared.readOnly') }}</span>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .shared-page { padding-block: 16px; }
      .shared-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
      .shared-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1.4rem; }
      .shared-loading, .shared-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 0; }
      .shared-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
      .shared-card { cursor: pointer; }
      .shared-desc { margin: 8px 0 0; opacity: 0.85; }
      .shared-owner { display: inline-flex; align-items: center; font-weight: 600; }
      .owner-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; vertical-align: middle; margin-right: 2px; }
      .habit-state { font-weight: 600; }
      .habit-state.inactive { opacity: 0.6; }
      .habit-progress { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
      .habit-progress-label { font-variant-numeric: tabular-nums; font-weight: 600; }
      .habit-pass { display: inline-flex; align-items: center; gap: 4px; color: var(--green, #2e7d32); }
      .shared-readonly {
        display: inline-flex; align-items: center; gap: 4px; margin-top: 10px;
        font-size: 0.75rem; opacity: 0.65;
      }
      .shared-readonly mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
    `,
  ],
})
export class SharedHabitListComponent {
  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly pageTitle = inject(AppPageTitle);
  private readonly destroyRef = inject(DestroyRef);

  readonly shared = signal<SharedHabitSummary[]>([]);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  constructor() {
    this.pageTitle.title = this.transloco.translate('habits.shared.title');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.service
      .getSharedHabits()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.shared.set(entries);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.loadFailed.set(true);
          showHabitError(this.snackbar, this.transloco, err);
        },
      });
  }

  root(habit: Habit) {
    return habit.progress.rootCriterion;
  }

  isDaily(habit: Habit): boolean {
    return this.root(habit).successType === 'daily';
  }

  progressPercent(habit: Habit): number {
    const r = this.root(habit);
    const goal = this.isDaily(habit) ? (r.cycleTarget ?? 1) : (r.threshold ?? 1);
    const current = this.isDaily(habit) ? (r.successfulDays ?? 0) : (r.currentValue ?? 0);
    return Math.min(100, Math.round((current / goal) * 100));
  }

  fmt(value: number | null): string {
    return value === null ? '—' : `${Math.round(value * 100) / 100}`;
  }
}
