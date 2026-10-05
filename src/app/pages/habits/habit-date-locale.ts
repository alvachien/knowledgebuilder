import type { Provider } from '@angular/core';
import { inject } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslocoService } from '@jsverse/transloco';
import type { Locale } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

/**
 * Pick the date-fns locale for the Material date pickers from an i18n language
 * tag (anything starting with `zh` → zhCN, otherwise enUS — the app ships only
 * en + zh-CN). Pure so it can be unit-tested without a TestBed.
 */
export function dateLocaleForLang(lang: string | null | undefined): Locale {
  return typeof lang === 'string' && lang.startsWith('zh') ? zhCN : enUS;
}

/**
 * Component/dialog provider for MAT_DATE_LOCALE that follows the ACTIVE
 * Transloco language instead of hardcoding zhCN. Without a MAT_DATE_LOCALE
 * override the adapter falls back to LOCALE_ID (a string), which date-fns
 * rejects when formatting calendar text.
 *
 * The factory is evaluated when the component (or dialog) is constructed: a
 * live language switch takes effect the next time a picker mounts — an
 * accepted trade-off (pickers are opened per user action; re-entering the page
 * always reflects the new language).
 */
export function provideHabitDateLocale(): Provider {
  return {
    provide: MAT_DATE_LOCALE,
    useFactory: () => dateLocaleForLang(inject(TranslocoService).getActiveLang()),
  };
}
