import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';

export interface HabitConfirmData {
  title: string;
  message: string;
  confirmLabel?: string;
}

/**
 * Reusable yes/no dialog for destructive actions (deactivate, delete habit,
 * delete punch). Resolves `true` on confirm, `false` on cancel. Strings are
 * pre-translated by the caller so the dialog stays content-free.
 */
@Component({
  selector: 'app-habits-confirm-dlg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogActions, MatDialogContent, MatDialogTitle, TranslocoModule],
  template: `
    <div *transloco="let t">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <!-- First focusable ⇒ MatDialog autoFocus focuses Cancel (safe default). -->
        <button mat-button (click)="reject()">{{ t('cancel') }}</button>
        <button mat-raised-button color="warn" (click)="accept()">
          {{ data.confirmLabel || t('ok') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class HabitConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<HabitConfirmDialogComponent>);
  readonly data = inject<HabitConfirmData>(MAT_DIALOG_DATA);

  accept(): void {
    this.dialogRef.close(true);
  }

  reject(): void {
    this.dialogRef.close(false);
  }
}
