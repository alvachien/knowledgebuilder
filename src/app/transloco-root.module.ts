import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Translation, TranslocoLoader} from '@jsverse/transloco';
import { provideTransloco } from '@jsverse/transloco';
import type { Observable } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TranslocoRootLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    // Use relative path - will be resolved relative to base href
    const url = `./data/i18n/${lang}.json`;
    console.debug(`Loading translation from: ${url}`);
    return this.http.get<Translation>(url);
  }
}

export function provideTranslocoStandalone() {
  return [
    provideTransloco({
      config: {
        availableLangs: ['en', 'zh-CN'],
        defaultLang: 'en',
        fallbackLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoRootLoader,
    }),
  ];
}
