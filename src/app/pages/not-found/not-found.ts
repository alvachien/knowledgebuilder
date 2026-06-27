import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, RouterLink, FooterComponent, TranslocoModule],
  host: {
    class: 'app-main-content',
  },
})
export class NotFoundComponent {
  @HostBinding('class.main-content') readonly mainContentClass = true;
}
