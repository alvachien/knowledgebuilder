import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslocoService,
  TRANSLOCO_MISSING_HANDLER,
  TRANSLOCO_TRANSPILER,
} from '@jsverse/transloco';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { AppPageTitle } from '../page-title/page-title';

import { HelpComponent } from './help.component';

/**
 * The public guide page. It is fully static now — one compiled component carrying both
 * language branches — so what matters is: the body follows the active language, the
 * tab title follows it too, every table-of-contents fragment resolves to a real heading
 * in the SAME branch (the regression this replace-on-fetch migration exists to prevent:
 * fragment links must be routerLink-driven, never plain href="#x", which would resolve
 * against <base href> and leave the SPA), and the study-page exits stay routerLink-based.
 */
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

/** The canonical section ids both language branches must carry, in TOC order. */
const SECTIONS = ['quick-start', 'vocabulary', 'chinese', 'knowledge-bank', 'habit-tracker', 'account'];

interface Harness {
  fixture: ReturnType<typeof TestBed.createComponent<HelpComponent>>;
  langChanges: BehaviorSubject<string>;
  appRef: ApplicationRef;
  router: Router;
}

async function renderHelp(startLang = 'en'): Promise<Harness> {
  // BehaviorSubject, not a bare Subject: the *transloco structural view renders only once it
  // has received a language, and HelpContentComponent's toSignal seed reads the same object.
  const langChanges = new BehaviorSubject<string>(startLang);
  TestBed.configureTestingModule({
    // A real (testing) router with the help route registered, so RouterLink's `href`
    // is computed for real and programmatic fragment navigations (the scroll test)
    // actually complete.
    imports: [RouterTestingModule.withRoutes([{ path: 'help', component: HelpComponent }])],
    providers: [
      { provide: AppPageTitle, useValue: { title: '' } },
      {
        provide: TranslocoService,
        useValue: {
          translate: vi.fn((key: string) => key),
          setActiveLang: vi.fn(),
          getActiveLang: vi.fn(() => startLang),
          selectTranslate: vi.fn().mockReturnValue(of('')),
          _loadDependencies: vi.fn().mockReturnValue(of(null)),
          langChanges$: langChanges,
          events$: of(),
          activeLang: startLang,
          config: { reRenderOnLangChange: true, prodMode: false },
        } as unknown as TranslocoService,
      },
      { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: {} },
    ],
  });

  const appRef = TestBed.inject(ApplicationRef);
  const fixture = TestBed.createComponent(HelpComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  appRef.tick();
  fixture.detectChanges();

  return { fixture, langChanges, appRef, router: TestBed.inject(Router) };
}

function switchLang(h: Harness, lang: string): Promise<void> {
  h.langChanges.next(lang);
  return (async () => {
    await h.fixture.whenStable();
    h.appRef.tick();
    h.fixture.detectChanges();
  })();
}

/** The fragment of each TOC anchor's href ('/help#vocabulary' → 'vocabulary'). */
function tocFragments(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLAnchorElement>('.help-toc a')).map((a) => {
    const href = a.getAttribute('href') ?? '';
    return href.includes('#') ? href.slice(href.indexOf('#') + 1) : `<<no-fragment:${href}>>`;
  });
}

describe('HelpComponent', () => {
  it('renders the English body by default', async () => {
    const h = await renderHelp('en');
    const text = norm(h.fixture.nativeElement.textContent);

    expect(text).toContain('Quick start');
    expect(text).toContain('Habit tracker');
    expect(text).not.toContain('快速上手');
  });

  it('swaps the body to the Chinese branch when the language changes, and back', async () => {
    const h = await renderHelp('en');

    await switchLang(h, 'zh-CN');
    let text = norm(h.fixture.nativeElement.textContent);
    expect(text).toContain('快速上手');
    expect(text).toContain('习惯打卡');
    expect(text).not.toContain('Quick start');

    await switchLang(h, 'en');
    text = norm(h.fixture.nativeElement.textContent);
    expect(text).toContain('Quick start');
  });

  it('falls back to the English branch for any other language id', async () => {
    const h = await renderHelp('fr');

    expect(norm(h.fixture.nativeElement.textContent)).toContain('Quick start');
  });

  it('titles the browser tab from the i18n key of the active language', async () => {
    await renderHelp('en');

    // The key-echo transloco stub returns the key itself.
    expect(TestBed.inject(AppPageTitle).title).toBe('help.title');
  });

  it('every English TOC anchor is a fragment link resolving to a real heading id', async () => {
    const h = await renderHelp('en');
    const root = h.fixture.nativeElement as HTMLElement;

    // No plain href="#x": each anchor must be router-driven (href carries the CURRENT
    // route path plus the fragment, never a bare "#sec-N" resolved against <base href>).
    expect(tocFragments(root)).toEqual(SECTIONS);
    for (const id of SECTIONS) {
      const heading = root.querySelector(`h2#${id}`);
      expect(heading, `missing heading id "${id}"`).toBeTruthy();
      expect(heading?.id).toBe(id);
    }
  });

  it('the Chinese branch mirrors the English section set, ids and TOC order', async () => {
    const h = await renderHelp('en');
    await switchLang(h, 'zh-CN');
    const root = h.fixture.nativeElement as HTMLElement;

    expect(tocFragments(root)).toEqual(SECTIONS);
    for (const id of SECTIONS) {
      expect(root.querySelector(`h2#${id}`), `missing heading id "${id}"`).toBeTruthy();
    }
  });

  it('TOC anchors point at the current route (fragment jump), not at the app root', async () => {
    const h = await renderHelp('en');
    const first = (h.fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('.help-toc a');

    // RouterLink resolves [] + fragment against the ACTIVE url — proving the jump stays
    // on the help route instead of the <base href> trap ("/" + fragment = homepage reload).
    // In the testing router the current url is '/', so the href must at least carry '#'.
    expect(first?.getAttribute('href')).toContain('#quick-start');
    expect(first?.getAttribute('target')).toBeNull();
  });

  it('scrolls the target heading into view on a fragment navigation', async () => {
    const h = await renderHelp('en');
    // jsdom has no layout: define the method and observe which element gets scrolled.
    const calls: string[] = [];
    (window.Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = function (
      this: Element,
    ) {
      calls.push(this.getAttribute('id') ?? '');
    };

    await h.router.navigate(['/', 'help'], { fragment: 'vocabulary' });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await h.fixture.whenStable();

    expect(calls).toContain('vocabulary');
  });

  it('offers the study pages as exits, always visible', async () => {
    const h = await renderHelp('en');
    const anchors: HTMLAnchorElement[] = Array.from(
      (h.fixture.nativeElement as HTMLElement).querySelectorAll('.help-exit a')
    );

    const hrefs = anchors.map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/vocabulary', '/chinese', '/knowledge', '/habits']);
  });
});
