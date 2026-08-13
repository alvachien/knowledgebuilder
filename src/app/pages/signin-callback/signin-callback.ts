import type { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import type { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule, TranslocoModule],
  templateUrl: './signin-callback.html',
  styleUrl: './signin-callback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SigninCallbackComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly subscription: Subscription;

  constructor() {
    // AuthService.checkAuth() is already running (constructed via the navbar at app
    // startup). After the IDP redirects back here, wait for the auth state to settle
    // - then navigate home. Without this the user is stranded on the spinner (M3).
    // On error, also navigate home so the user isn't stuck on a bare spinner; the
    // navbar (rendered app-wide) surfaces the error banner.
    this.subscription = this.authService.authContent
      .pipe(filter(info => info.isAuthorized || !!info.getErrorMessage()))
      .subscribe(() => {
        void this.router.navigate(['/']);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
