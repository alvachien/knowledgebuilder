import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subject, catchError, debounceTime, distinctUntilChanged, firstValueFrom, of, switchMap } from 'rxjs';

import { showHabitError } from './habit-error-messages';
import type { ShareGrant, UserSearchHit } from './habit.models';
import { HabitService } from './habit.service';

export interface HabitSharesDialogData {
  habitId: number;
  habitName: string;
}

/**
 * Per-habit invitation manager (owner-only). Invitees get READ-ONLY visibility of the
 * habit + its full punch history under "Shared with me" — nobody else sees anything.
 * Grants take effect immediately (no accept step); revoking re-privatizes instantly,
 * so no confirm dialogs are needed. The picker queries acidserver's user search
 * (username substring → { userId, userName }); only usernames are ever shown — never
 * emails. Adding yourself is rejected server-side (invalidGrantee) and surfaces as a
 * snackbar.
 */
@Component({
  selector: 'app-habits-shares-dlg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  template: `
    <div *transloco="let t">
      <h2 mat-dialog-title>
        <mat-icon>group_add</mat-icon>
        {{ t('habits.shares.title', { name: data.habitName }) }}
      </h2>
      <mat-dialog-content>
        <p class="shares-hint">{{ t('habits.shares.hint') }}</p>

        <h3 class="shares-section-title">{{ t('habits.shares.current') }}</h3>
        @if (loadingGrants()) {
          <mat-spinner diameter="24" class="shares-spinner"></mat-spinner>
        } @else if (grants().length === 0) {
          <p class="shares-empty">{{ t('habits.shares.empty') }}</p>
        } @else {
          @for (grant of grants(); track grant.id) {
            <div class="share-row">
              <mat-icon class="share-avatar">person</mat-icon>
              <span class="share-name">{{ grant.granteeUserName }}</span>
              <button
                mat-icon-button
                (click)="remove(grant)"
                [attr.aria-label]="t('habits.shares.remove')"
                [disabled]="busyGrants.has(grant.id)">
                <mat-icon>person_remove</mat-icon>
              </button>
            </div>
          }
        }

        <h3 class="shares-section-title">{{ t('habits.shares.find') }}</h3>
        <div class="shares-search">
          <input
            #searchInput
            class="shares-input"
            [value]="query()"
            (input)="onQueryChange(searchInput.value)"
            (keyup.enter)="onQueryChange(searchInput.value)"
            [attr.placeholder]="t('habits.shares.search')" />
          @if (searching()) {
            <mat-spinner diameter="20"></mat-spinner>
          }
        </div>

        @if (queryInvalid()) {
          <p class="shares-empty">{{ t('habits.shares.tooShort') }}</p>
        }
        @if (!searching() && results().length === 0 && searchedOnce() && !queryInvalid()) {
          <p class="shares-empty">{{ t('habits.shares.noMatches') }}</p>
        }
        @for (hit of results(); track hit.userId) {
          <div class="share-row">
            <mat-icon class="share-avatar">badge</mat-icon>
            <span class="share-name">{{ hit.userName }}</span>
            <button
              mat-stroked-button
              color="primary"
              (click)="invite(hit)"
              [disabled]="isAlreadyInvited(hit) || busyUsers.has(hit.userId)">
              <!-- The @if block must hold a SINGLE node or the leading
                   <mat-icon> misses MatButton's icon slot (NG8011). -->
              @if (isAlreadyInvited(hit)) {
                <mat-icon>check</mat-icon>
              }
              <span>{{ isAlreadyInvited(hit) ? t('habits.shares.invited') : t('habits.shares.add') }}</span>
            </button>
          </div>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="ref.close()">{{ t('close') }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .shares-hint { font-size: 0.85rem; opacity: 0.75; margin: 0 0 8px; }
      .shares-section-title { font-size: 0.9rem; margin: 14px 0 6px; }
      .shares-empty { opacity: 0.7; font-size: 0.85rem; padding: 4px 0; }
      .shares-spinner { margin: 8px 0; }
      .share-row {
        display: flex; align-items: center; gap: 8px; padding: 4px 0;
        & + .share-row { border-top: 1px solid rgba(128, 128, 128, 0.15); }
      }
      .share-avatar { opacity: 0.7; }
      .share-name { flex: 1 1 auto; font-weight: 500; }
      .shares-search { display: flex; align-items: center; gap: 8px; }
      .shares-input {
        flex: 1 1 auto; padding: 8px 10px; font-size: 0.9rem;
        border: 1px solid rgba(128, 128, 128, 0.4); border-radius: 6px; background: transparent;
      }
    `,
  ],
})
export class HabitSharesDialogComponent {
  readonly ref = inject(MatDialogRef<HabitSharesDialogComponent>);
  readonly data = inject<HabitSharesDialogData>(MAT_DIALOG_DATA);

  private readonly service = inject(HabitService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly grants = signal<ShareGrant[]>([]);
  readonly results = signal<UserSearchHit[]>([]);
  readonly query = signal('');
  readonly loadingGrants = signal(true);
  readonly searching = signal(false);
  readonly searchedOnce = signal(false);
  readonly queryInvalid = signal(false);

  /** In-flight UI states — plain sets (rows are few; signals not needed for correctness). */
  readonly busyGrants = new Set<number>();
  readonly busyUsers = new Set<string>();

  private readonly query$ = new Subject<string>();

  constructor() {
    void this.loadGrants();

    this.query$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 2) {
            this.results.set([]);
            this.searching.set(false);
            return of<UserSearchHit[]>([]);
          }
          this.queryInvalid.set(false);
          this.searching.set(true);
          return this.service.searchUsers(term).pipe(
            catchError((err: unknown) => {
              showHabitError(this.snackbar, this.transloco, err);
              return of<UserSearchHit[]>([]);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((hits) => {
        this.results.set(hits);
        this.searching.set(false);
        this.searchedOnce.set(true);
      });
  }

  onQueryChange(value: string): void {
    const term = value.trim();
    this.query.set(value);
    if (term.length > 0 && term.length < 2) {
      // typed but too short — show the hint instead of a spinner for 300ms
      this.queryInvalid.set(true);
      this.results.set([]);
    }
    this.query$.next(term);
  }

  isAlreadyInvited(hit: UserSearchHit): boolean {
    return this.grants().some((g) => g.granteeUserId === hit.userId);
  }

  invite(hit: UserSearchHit): void {
    if (this.isAlreadyInvited(hit) || this.busyUsers.has(hit.userId)) {
      return;
    }
    this.busyUsers.add(hit.userId);
    this.service
      .addShare(this.data.habitId, hit.userId, hit.userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.loadGrants();
          this.snackbar.open(
            this.transloco.translate('habits.shares.added', { name: hit.userName }),
            undefined,
            { duration: 3000 }
          );
        },
        error: (err: unknown) => {
          this.busyUsers.delete(hit.userId);
          showHabitError(this.snackbar, this.transloco, err);
        },
      });
  }

  remove(grant: ShareGrant): void {
    this.busyGrants.add(grant.id);
    this.service
      .deleteShare(this.data.habitId, grant.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.loadGrants();
          this.snackbar.open(
            this.transloco.translate('habits.shares.removed', { name: grant.granteeUserName }),
            undefined,
            { duration: 3000 }
          );
        },
        error: (err: unknown) => {
          this.busyGrants.delete(grant.id);
          showHabitError(this.snackbar, this.transloco, err);
        },
      });
  }

  private async loadGrants(): Promise<void> {
    this.loadingGrants.set(true);
    try {
      this.grants.set(await firstValueFrom(this.service.getShares(this.data.habitId)));
    } catch (err) {
      showHabitError(this.snackbar, this.transloco, err);
    } finally {
      this.loadingGrants.set(false);
    }
  }
}
