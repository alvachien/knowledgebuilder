import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { AppLogoComponent } from '../logo/logo';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [AppLogoComponent, TranslocoModule],
})
export class FooterComponent {
  year = new Date().getFullYear();
  releaseddate = environment.releasedate;
  version = environment.version;
}
