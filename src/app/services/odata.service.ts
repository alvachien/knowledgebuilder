import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ODataService {
  apiUrl = `https://localhost:44355/odata/`;

  constructor(private http: HttpClient,
    ) { }

  public getMetadata(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    // let params: HttpParams = new HttpParams();
    // params = params.append('$count', 'true');
    return this.http.get(`${this.apiUrl}$metadata`, {
        headers,
        // params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        const rjs = response as unknown as string;
        return rjs;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public getKnowledgeItems(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,Category,Title,CreatedAt,ModifiedAt');
    return this.http.get(`${this.apiUrl}KnowledgeItems`, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        const rjs = response as any;
        return {
          total_count: rjs['@odata.count'],
          items: rjs.value as any[]
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public getKnowledgeItem(kid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,Category,Title,Content');
    params = params.append('$expand', 'QuestionBankItems');
    return this.http.get(`${this.apiUrl}KnowledgeItems(${kid})`, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        const rjs = response as any;
        return {
          total_count: rjs['@odata.count'],
          items: rjs.value as any[]
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public createKnowledgeItem(ki: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    // let params: HttpParams = new HttpParams();
    // params = params.append('$top', '100');
    // params = params.append('$count', 'true');
    // params = params.append('$select', 'ID,Category,Title,CreatedAt,ModifiedAt');
    return this.http.post(`${this.apiUrl}KnowledgeItems`, ki, {
        headers
        // params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        const rjs = response as any;
        return {
          total_count: rjs['@odata.count'],
          items: rjs.value as any[]
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public getQuestionBankItems(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,KnowledgeItemID,ParentID,QBType,Content');
    return this.http.get(`${this.apiUrl}QuestionBankItems`, {
        headers,
        params,
      })
      .pipe(map((response: HttpResponse<any>) => {
        const rjs = response as any;
        return {
          total_count: rjs['@odata.count'],
          items: rjs.value as any[]
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
}
