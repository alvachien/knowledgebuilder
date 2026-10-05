import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

import { NavbarComponent } from './shared/navbar/navbar';

/**
 * One-time cleanup for the removed "Mark & Ledger" theme picker: `theme-storage`
 * (deleted with the redesign) persisted under this key, and existing users still
 * have it. The try/catch mirrors the resilience expected around browser storage
 * (private modes can throw even on removeItem).
 */
function clearLegacyThemeStorage(): void {
  try {
    localStorage.removeItem('kb-theme-storage-current-name');
  } catch {
    // Storage unavailable/disabled — nothing to clean up.
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, NavbarComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Knowledge Habit Builder';
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  private media = inject(MediaMatcher);
  private changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    clearLegacyThemeStorage();
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  onOpenHome() {
    // DO nothing now
  }
  openCodeRepo() {
    // DO nothing now
  }
  onUserInfo() {
    // DO nothing now
  }
  onLogon() {
    // DO nothing now
  }
  onLogout() {
    // DO nothing now
  }
}
