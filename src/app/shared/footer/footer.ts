import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { AppLogoComponent } from '../logo/logo';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppLogoComponent, TranslocoModule],
})
export class FooterComponent {
  year = new Date().getFullYear();
  releaseddate = environment.releasedate;
  version = environment.version;
}
