import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { showHabitError } from './habit-error-messages';
import type { PropertyValueCreate, PunchOut } from './habit.models';
import { HabitService } from './habit.service';

export interface HabitPunchEditData {
  habitId: number;
  itemId: number;
  punch: PunchOut;
  /** Property ids whose list uniqueness is per_cycle (drives the uniqueness hint). */
  perCyclePropertyIds: number[];
}

/**
 * Edit one existing punch session (FR-3.4). Prefills the values as recorded in this
 * session — never the cycle totals. The punch DATE is immutable (spec FR-3.4):
 * moving a session to another day means delete + re-punch, surfaced as a hint.
 * Corrections are allowed even after deactivation or the end date (FR-3.4 exempts
 * edits/deletes from the FR-3.3 window gate). Closes with `'saved'` on success.
 */
@Component({
  selector: 'app-habits-punch-edit-dlg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    TranslocoModule,
  ],
  template: `
    <div *transloco="let t">
      <h2 mat-dialog-title>{{ t('habits.editPunch.title', { date: data.punch.punchDate }) }}</h2>
      <mat-dialog-content>
        <p class="date-hint">{{ t('habits.editPunch.dateImmutable') }}</p>
        @if (rows.length === 0) {
          <!-- The API upserts same-day booleans into the session that owns the
               row, so a punch can come back with an EMPTY values array — render
               that as an explicit "nothing to edit" state, not a broken form. -->
          <p class="empty-hint">{{ t('habits.editPunch.emptyValues') }}</p>
        }
        @for (row of rows; track row.propertyId) {
          @switch (row.propertyType) {
            @case ('boolean') {
              <mat-checkbox [(ngModel)]="row.boolValue">{{ row.name }}</mat-checkbox>
            }
            @case ('numeric') {
              <mat-form-field class="ctrl-field" appearance="outline">
                <mat-label>{{ row.name }}</mat-label>
                <input matInput type="number" min="0.01" step="any" [(ngModel)]="row.numValue" />
              </mat-form-field>
            }
            @default {
              <mat-form-field class="ctrl-field" appearance="outline">
                <mat-label>{{ row.name }}</mat-label>
                <textarea matInput rows="3" [(ngModel)]="row.entriesText"></textarea>
                <mat-hint>{{ t('habits.punch.onePerLine') }}</mat-hint>
                @if (data.perCyclePropertyIds.includes(row.propertyId)) {
                  <mat-hint align="end">{{ t('habits.editPunch.perCycleHint') }}</mat-hint>
                }
              </mat-form-field>
            }
          }
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(undefined)">{{ t('cancel') }}</button>
        <button mat-raised-button color="primary" [disabled]="rows.length === 0" (click)="save()">{{ t('ok') }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`.ctrl-field { width: 100%; display: block; } .empty-hint { opacity: 0.7; } .date-hint { opacity: 0.7; font-size: 0.8rem; margin: 0 0 8px; }`],
})
export class HabitPunchEditDialogComponent {
  readonly data = inject<HabitPunchEditData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<HabitPunchEditDialogComponent>);

  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly rows = this.data.punch.values.map((v) => ({
    propertyId: v.propertyId,
    name: v.propertyName,
    propertyType: v.propertyType,
    boolValue: v.boolValue ?? false,
    numValue: v.numValue ?? null,
    entriesText: (v.listEntries ?? []).join('\n'),
  }));

  async save(): Promise<void> {
    const values: PropertyValueCreate[] = [];
    for (const row of this.rows) {
      switch (row.propertyType) {
        case 'boolean':
          values.push({ propertyId: row.propertyId, boolValue: row.boolValue });
          break;
        case 'numeric':
          values.push({ propertyId: row.propertyId, numValue: row.numValue });
          break;
        default:
          values.push({
            propertyId: row.propertyId,
            listEntries: row.entriesText.split('\n').map((s) => s.trim()).filter((s) => s.length > 0),
          });
      }
    }

    try {
      await firstValueFrom(
        this.service.updatePunch(this.data.habitId, this.data.itemId, this.data.punch.id, { values })
      );
      this.dialogRef.close('saved');
    } catch (err) {
      showHabitError(this.snackbar, this.transloco, err);
    }
  }
}
