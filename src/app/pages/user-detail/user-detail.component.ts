import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';

import type { UserAuthInfo } from '../../interfaces';
import { AuthService } from '../../services';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  host: {
    class: 'app-main-content',
  },
})
export class UserDetailComponent implements OnInit, OnDestroy {
  userId = '';
  userName = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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
