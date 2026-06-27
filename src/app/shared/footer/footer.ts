import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AppLogoComponent } from '../logo/logo';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [AppLogoComponent],
})
export class FooterComponent {
  year = new Date().getFullYear();
  releaseddate = environment.releasedate;
  version = environment.version;
}
