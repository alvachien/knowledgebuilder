import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { throwError } from 'rxjs';

import { environment } from '../../environments/environment';

import { UserCodeService } from './user-code.service';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private http = inject(HttpClient);
  private usr = inject(UserCodeService);

  constructor() { }

  getTTS(sent: string) {
    if (!this.usr.isUserCodeEntered) {
      return throwError(() => new Error('Data file is not found!'));
    }

    const url = `${environment.apiUrl}/api/TTS/details`;
    const params = new HttpParams().set('sentence', sent);

    return this.http.get(url, { params });
  }

  explainSentence(sent: string) {
    if (!this.usr.isUserCodeEntered) {
      return throwError(() => new Error('Data file is not found!'));
    }

    const url = `${environment.apiUrl}/api/EnglishLLM/details`;
    const params = new HttpParams().set('sentence', sent);

    return this.http.get(url, { params });
  }

  explainFormat(formattype: string, context: string) {
    if (!this.usr.isUserCodeEntered) {
      return throwError(() => new Error('Data file is not found!'));
    }

    const url = `${environment.apiUrl}/api/FormatLLM/AskAnything`;

    return this.http.post(url, {
      formattype: formattype,
      context: context
    });
  }
}
