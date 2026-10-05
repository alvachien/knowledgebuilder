import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, of, Subject, takeUntil } from 'rxjs';

import type { UserAuthInfo, UserLoginHistory } from '../../interfaces';
import { AuthService, UserLoginHistoryService } from '../../services';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, MatIconModule, TranslocoModule, DatePipe],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  host: {
    class: 'app-main-content',
  },
})
export class UserDetailComponent implements OnInit, OnDestroy {
  userId = '';
  userName = '';
  history: UserLoginHistory[] = [];
  historyLoading = true;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loginHistory = inject(UserLoginHistoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<boolean>();

  ngOnInit(): void {
    this.authService.authContent
      .pipe(takeUntil(this.destroy$))
      .subscribe((auth: UserAuthInfo) => {
        this.userId = auth.getUserId() ?? '';
        this.userName = auth.getUserName() ?? '';
        this.cdr.markForCheck();
      });

    // Server default window: trailing 90 days. A failed load must clear the flag so
    // the card shows the empty state instead of a stuck spinner.
    this.loginHistory.getHistory()
      .pipe(takeUntil(this.destroy$), catchError(() => of([] as UserLoginHistory[])))
      .subscribe(rows => {
        this.history = rows;
        this.historyLoading = false;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onLogout(): void {
    this.authService.doLogout();
    void this.router.navigate(['/']);
  }
}
