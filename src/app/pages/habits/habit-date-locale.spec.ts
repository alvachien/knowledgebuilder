import { TestBed } from '@angular/core/testing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslocoService } from '@jsverse/transloco';
import { enUS, zhCN } from 'date-fns/locale';

import { dateLocaleForLang, provideHabitDateLocale } from './habit-date-locale';

describe('dateLocaleForLang', () => {
  it('maps Chinese tags to the date-fns zhCN locale object', () => {
    expect(dateLocaleForLang('zh-CN')).toBe(zhCN);
    expect(dateLocaleForLang('zh')).toBe(zhCN);
  });

  it('maps English and unknown/missing tags to enUS', () => {
    expect(dateLocaleForLang('en')).toBe(enUS);
    expect(dateLocaleForLang('fr')).toBe(enUS);
    expect(dateLocaleForLang(null)).toBe(enUS);
    expect(dateLocaleForLang(undefined)).toBe(enUS);
  });
});

describe('provideHabitDateLocale', () => {
  function localeForActiveLang(lang: string): unknown {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHabitDateLocale(),
        { provide: TranslocoService, useValue: { getActiveLang: () => lang } },
      ],
    });
    return TestBed.inject(MAT_DATE_LOCALE);
  }

  it('resolves zhCN when the active Transloco language is Chinese', () => {
    expect(localeForActiveLang('zh-CN')).toBe(zhCN);
  });

  it('resolves enUS when the active Transloco language is English', () => {
    expect(localeForActiveLang('en')).toBe(enUS);
  });
});
