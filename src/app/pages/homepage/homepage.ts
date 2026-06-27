import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, HostBinding, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { differenceInDays } from 'date-fns';

import { FooterComponent } from '../../shared/footer/footer';
import { NavigationFocusDirective } from '../../shared/navigation-focus/navigation-focus';
import { AppPageTitle } from '../page-title/page-title';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavigationFocusDirective,
    MatButtonModule,
    RouterLink,
    MatDividerModule,
    MatIconModule,
    MatCardModule,
    FooterComponent,
    TranslocoModule,
  ],
  host: {
    class: 'app-main-content',
  },
})
export class HomepageComponent implements OnInit {
  @HostBinding('class.main-content') readonly mainContentClass = true;
  @HostBinding('class.animations-disabled') readonly animationsDisabled = false;

  daysleft1: number;
  daysleft2: number;
  daysleft3: number;
  pageTitle = inject(AppPageTitle);

  constructor() {
    const today = new Date();
    this.daysleft1 = differenceInDays(new Date(2027, 4, 22), today);
    this.daysleft2 = differenceInDays(new Date(2028, 5, 15), today);
    this.daysleft3 = differenceInDays(new Date(2031, 5, 6), today);
  }

  ngOnInit(): void {
    this.pageTitle.title = '';
  }
}
