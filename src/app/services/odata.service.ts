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
        const rjs: any = response as any;
        return rjs;
      }),
      catchError((error: HttpErrorResponse) => {

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
}
