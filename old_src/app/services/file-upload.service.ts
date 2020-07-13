import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  public uploadFile(fileToUpload: File): Observable<string> {
    const endpoint = environment.APIUrl + 'Pictures';
    const formData: FormData = new FormData();
    formData.append('fileKey', fileToUpload, fileToUpload.name);
    // let headers: HttpHeaders = new HttpHeaders();
    // headers = headers.append('Content-Type', 'multipart/form-data');
    return this.http
      .post(endpoint, formData)
      .pipe(map((response: HttpResponse<any>) => {
        return response as unknown as string;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
}
