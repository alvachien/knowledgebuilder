import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-signin-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule, TranslocoModule],
  templateUrl: './signin-callback.html',
  styleUrl: './signin-callback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SigninCallbackComponent {}
