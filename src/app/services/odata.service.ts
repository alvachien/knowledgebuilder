import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';

import { Observable, throwError, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ODataService {
  apiRoot = `https://localhost:44355`;
  apiUrl = `${this.apiRoot}/odata/`;
  uploadUrl = `${this.apiRoot}/api/ImageUpload`;

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
      .pipe(map(response => {
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
      .pipe(map(response => {
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

  public readKnowledgeItem(kid: number): Observable<any> {
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
      .pipe(map(response => {
        return response as any;
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
      .pipe(map(response => {
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
      .pipe(map(response => {
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

  public createQuestionBankItem(qbi: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    // let params: HttpParams = new HttpParams();
    return this.http.post(`${this.apiUrl}QuestionBankItems`, qbi, {
        headers,
        // params,
      })
      .pipe(map(response => {
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

  public readQuestionBankItem(qbid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    // params = params.append('$select', 'ID,KnowledgeItemID,ParentID,QBType,Content');
    // params = params.append('$expand', 'SubItems');
    return this.http.get(`${this.apiUrl}QuestionBankItems(${qbid})`, {
        headers,
        // params,
      })
      .pipe(map(response => {
        return response as any;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public uploadFiles(files: Set<File>):
    { [key: string]: { result: Observable<any> } } {

    // this will be the our resulting map
    const status: { [key: string]: { result: Observable<any> } } = {};

    files.forEach(file => {
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest('POST', this.uploadUrl, formData);

      // create a new progress-subject for every file
      const result = new Subject<any>();

      // send the http-request and subscribe for progress-updates
      this.http.request(req).subscribe(event => {
        if (event instanceof HttpResponse) {
          result.next({
            delete_type: event.body[0].delete_type,
            delete_url: `${this.apiRoot}${event.body[0].delete_url}`,
            name: event.body[0].name,
            progress: 1,
            size: event.body[0].size,
            thumbnail_url: `${this.apiRoot}${event.body[0].thumbnail_url}`,
            type: event.body[0].type,
            url: `${this.apiRoot}${event.body[0].url}`,
          });

          result.complete();
        }
      });

      // Save every progress-observable in a map of all observables
      status[file.name] = {
        result: result.asObservable()
      };
    });

    // return the map of progress.observables
    return status;
  }
}
