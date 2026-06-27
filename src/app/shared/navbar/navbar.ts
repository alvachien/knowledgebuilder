import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { UserAuthInfo } from '../../interfaces';
import { AuthService, UserCodeService } from '../../services';
import { LanguageSelectorComponent } from '../language-selector';
import { AppLogoComponent } from '../logo/logo';
import { NavigationFocusService } from '../navigation-focus/navigation-focus.service';
import { ThemePickerComponent } from '../theme-picker/theme-picker';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    ThemePickerComponent,
    AppLogoComponent,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    LanguageSelectorComponent,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnDestroy {
  private static readonly SMALL_SCREEN_QUERY = '(max-width: 820px)';

  private subscriptions = new Subscription();
  skipLinkHref: string | null | undefined;
  skipLinkHidden = true;
  homeUrl = '';
  readonly dialog = inject(MatDialog);
  readonly usrsrv = inject(UserCodeService);
  readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly media = inject(MediaMatcher);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoggedIn = false;
  userName = '';
  authError = '';
  drawerOpened = false;
  isSmallScreen = false;

  private readonly mobileQuery: MediaQueryList;
  private readonly mobileQueryListener: () => void;
  private navigationFocusService = inject(NavigationFocusService);

  constructor() {
    this.homeUrl = environment.homeurl;
    setTimeout(() => (this.skipLinkHref = this.navigationFocusService.getSkipLinkHref()), 100);

    this.mobileQuery = this.media.matchMedia(NavbarComponent.SMALL_SCREEN_QUERY);
    this.isSmallScreen = this.mobileQuery.matches;
    this.mobileQueryListener = () => {
      this.isSmallScreen = this.mobileQuery.matches;
      if (!this.isSmallScreen) {
        this.drawerOpened = false;
      }
      this.cdr.detectChanges();
    };
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);

    this.subscriptions.add(
      this.authService.authContent.subscribe((info: UserAuthInfo) => {
        this.isLoggedIn = info.isAuthorized;
        this.userName = info.getUserName() ?? '';
        const errorKey = info.getErrorMessage();
        this.authError = errorKey ? (this.transloco.translate(errorKey) ?? errorKey) : '';
        if (errorKey) {
          this.snackBar.open(this.authError, undefined, {
            duration: 5_000,
            panelClass: ['auth-error-snackbar'],
          });
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  toggleDrawer(): void {
    this.drawerOpened = !this.drawerOpened;
  }

  closeDrawer(): void {
    this.drawerOpened = false;
  }

  onLogon(): void {
    this.authService.clearError();
    this.authService.doLogin();
  }

  onLogout(): void {
    this.authService.doLogout();
  }

  onUserDetail(): void {
    void this.router.navigate(['/user-detail']);
  }

  onDismissError(): void {
    this.authService.clearError();
  }

  onSetUser() {
    this.dialog.open(UserInfoDialogComponent, {
      data: {
        usercode: this.usrsrv.getUserCode(),
      },
      width: '500px',
      height: '250px',
      enterAnimationDuration: 800,
      exitAnimationDuration: 500,
    });
  }
}

@Component({
  selector: 'app-userinfo-dlg',
  templateUrl: 'userinfo-dlg.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoDialogComponent {
  readonly dialogRef = inject(MatDialogRef<UserInfoDialogComponent>);
  readonly usercode = model('');
  readonly usrsrv = inject(UserCodeService);
  readonly data = inject(MAT_DIALOG_DATA) as { usercode: string };

  constructor() {
    this.usercode.set(this.data.usercode ? this.data.usercode : '');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    const ncode = this.usercode();
    this.usrsrv.setUserCode(ncode);

    this.dialogRef.close();
  }
}
