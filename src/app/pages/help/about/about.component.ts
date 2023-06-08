import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-help-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  get versionNumber(): string {
    return environment.version;
  }
  get buildDate(): string {
    return environment.buildDate;
  }
}
