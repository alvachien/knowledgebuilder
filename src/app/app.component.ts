import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, inject } from '@angular/core';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

import { NavbarComponent } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, NavbarComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Knowledge Builder';
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  private media = inject(MediaMatcher);
  private changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
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
