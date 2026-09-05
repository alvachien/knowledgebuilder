import { Component, HostBinding, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-logo',
  styleUrl: 'logo.scss',
  templateUrl: './logo.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class AppLogoComponent {
  @HostBinding('attr.aria-hidden')
  ariaHidden = true;
}
