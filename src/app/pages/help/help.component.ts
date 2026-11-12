import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { NAV_ICON } from '../../shared/nav-icons';
import { AppPageTitle } from '../page-title/page-title';

import { HelpContentComponent } from './help-content.component';

/**
 * Help / "how to use the app" page (`/help`).
 *
 * Public by design — it is the page that answers "should I sign in, and what happens after
 * I do", so it must be readable without a token. The whole body is `HelpContentComponent`,
 * a single compiled component carrying both language variants and switched by the app's
 * active Transloco language; only the chrome strings (title, intro) are transloco keys.
 * Nothing is fetched, so there is no loading or failure state.
 *
 * Section jumps come from the body's own table of contents: `[routerLink]="[]" [fragment]`
 * links against `id="..."` headings, with the scroll performed by HelpContentComponent
 * (the app scrolls inside .app-main-content, so the router's viewport-based anchorScrolling
 * would be a no-op). Plain `href="#x"` anchors would resolve against the document
 * <base href>, not the current route, and leave the SPA at "/" — see app.config.
 */
@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
  host: { class: 'app-main-content' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslocoModule,
    HelpContentComponent,
  ],
})
export class HelpComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly pageTitle = inject(AppPageTitle);

  protected readonly navIcon = NAV_ICON;

  constructor() {
    // The browser title follows the active language — now, and after every switch from
    // the language selector. The body itself re-renders on its own (HelpContentComponent
    // reads the same langChanges$).
    this.transloco.langChanges$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.applyLang());
    this.applyLang();
  }

  /** Retitle the tab for the active language. */
  private applyLang(): void {
    this.pageTitle.title = this.transloco.translate('help.title');
  }
}
