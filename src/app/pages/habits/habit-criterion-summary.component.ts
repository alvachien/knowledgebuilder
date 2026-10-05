import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

import type { CriterionProgressOut } from './habit.models';

/**
 * Compact criterion-tree overview used on habit cards and the detail header.
 * Collapsed: an "N / M passing" chip. Expanded: one row per criterion with its
 * pass/fail chip and `currentValue / threshold` (condition) or operator + passing
 * operand count (composite). Callers must not render this for ≤ 1 criteria
 * (design-habit-ui.md § CriterionSummaryComponent).
 */
@Component({
  selector: 'app-habit-criterion-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TranslocoModule],
  template: `
    <div *transloco="let t" class="criterion-summary">
      <button type="button" class="summary-head" (click)="expanded.set(!expanded())">
        <mat-icon class="summary-chevron">{{ expanded() ? 'expand_less' : 'expand_more' }}</mat-icon>
        <span class="summary-chip">{{ t('habits.summary.passing', { passing: passingCount(), total: criteria().length }) }}</span>
      </button>
      @if (expanded()) {
        <ul class="summary-rows">
          @for (c of criteria(); track c.criterionId) {
            <li class="summary-row">
              <mat-icon [class.ok]="c.passed" [class.bad]="!c.passed">
                {{ c.passed ? 'check_circle' : 'cancel' }}
              </mat-icon>
              <span class="summary-name">{{ c.name }}</span>
              @if (c.criterionType === 'condition') {
                <span class="summary-value">{{ display(c.currentValue) }} / {{ display(c.threshold) }}</span>
              } @else {
                <span class="summary-op">{{ t('habits.operator.' + c.operator) }}</span>
                <span class="summary-value">{{ c.currentValue }} / {{ c.threshold }}</span>
                <span class="summary-operands">{{ operandNames(c) }}</span>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .criterion-summary { font-size: 0.85rem; }
      .summary-head { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; color: inherit; }
      .summary-chevron { font-size: 1rem; width: 1rem; height: 1rem; line-height: 1rem; }
      .summary-chip { opacity: 0.85; }
      .summary-rows { list-style: none; margin: 4px 0 0; padding: 0; }
      .summary-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
      .summary-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
      .summary-row mat-icon.ok { color: var(--green, #2e7d32); }
      .summary-row mat-icon.bad { color: var(--red, #c62828); }
      .summary-op { text-transform: uppercase; font-weight: 600; font-size: 0.7rem; opacity: 0.7; }
      .summary-operands { opacity: 0.6; }
    `,
  ],
})
export class HabitCriterionSummaryComponent {
  readonly criteria = input.required<CriterionProgressOut[]>();

  readonly expanded = signal(false);

  readonly passingCount = computed(() => this.criteria().filter((c) => c.passed).length);

  display(value: number | null): string {
    return value === null ? '—' : `${Math.round(value * 100) / 100}`;
  }

  operandNames(c: CriterionProgressOut): string {
    const byId = new Map(this.criteria().map((x) => [x.criterionId, x.name]));
    return (c.operandIds ?? []).map((id) => byId.get(id) ?? `#${id}`).join(', ');
  }
}
