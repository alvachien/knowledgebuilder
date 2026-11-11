import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationSkipped, Router, RouterLink } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map } from 'rxjs';

/**
 * The help guide body — ONE component carrying both language variants as template
 * branches, switched by the app's active Transloco language (anything other than
 * 'zh-CN' shows English, matching Transloco's `fallbackLang`). Was one runtime-fetched
 * markdown asset per language; the compiled templates fix the table of contents:
 * section jumps use `[routerLink]="[]" [fragment]` — plain `href="#x"` resolves against
 * the document <base href> (dev "/", prod "/learning/") instead of the current route,
 * and would land on the homepage. Prose styling comes from the global
 * `.help-doc .app-markdown` rules in styles/_markdown.scss; keep those wrapper classes.
 * The two language branches must mirror each other's section set, ids and TOC order
 * (guarded by help.component.spec).
 */
@Component({
  selector: 'app-help-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './help-content.component.html',
})
export class HelpContentComponent {
  private readonly transloco = inject(TranslocoService);

  /** Active language as a signal; Transloco pushes here on every language switch. */
  protected readonly lang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  constructor() {
    // Fragment scrolling, done here instead of the router's `anchorScrolling`: this app
    // scrolls inside `.app-main-content` (overflow-y: auto — app.component.scss), not the
    // window, and Angular's viewport scroller calls window.scrollTo(...) — a visible no-op
    // with the inner scroller. `scrollIntoView` walks the real scrollable ancestors, so it
    // works regardless. One rAF of delay lets the just-rendered branch settle first; a
    // missing id is a silent no-op (deep links into sections that exist only after the
    // branch renders simply stay put).
    const router = inject(Router);
    router.events
      .pipe(
        filter((e): e is NavigationEnd | NavigationSkipped =>
          e instanceof NavigationEnd || e instanceof NavigationSkipped,
        ),
        map((e) => e.url),
        map((url) => {
          const hash = url.indexOf('#');
          return hash === -1 ? '' : decodeURIComponent(url.slice(hash + 1));
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((fragment) => {
        if (!fragment) {
          return;
        }
        requestAnimationFrame(() => {
          document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
  }
}
