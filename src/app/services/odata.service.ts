import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ExerciseItem, TagCount, Tag, KnowledgeItem, TagReferenceType, OverviewInfo } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ODataService {
  apiUrl = `${environment.apiurl_root}/odata/`;
  uploadUrl = `${environment.apiurl_root}/api/ImageUpload`;

  private isMetadataLoaded = false;
  private metadataInfo = '';

  constructor(private http: HttpClient,
    ) { }

  public getMetadata(forceReload?: boolean): Observable<any> {
    if (!environment.mockdata && (!this.isMetadataLoaded || forceReload)) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/xml,application/json')
                .append('Accept', 'text/html,application/xhtml+xml,application/xml');

      return this.http.get(`${this.apiUrl}$metadata`, {
          headers,
          responseType: 'text'
        })
        .pipe(map(response => {
          this.isMetadataLoaded = true;
          this.metadataInfo = response as unknown as string;
          return this.metadataInfo;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this.metadataInfo);
    }
  }

  public getKnowledgeItems(): Observable<{
    totalCount: number,
    items: KnowledgeItem[]}> {
    if (environment.mockdata) {
      return of({totalCount: 0, items: []});
    }

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
        const ritems = rjs.value as any[];
        const items: KnowledgeItem[] = [];
        ritems.forEach(item => {
          const rit: KnowledgeItem = new KnowledgeItem();
          rit.parseData(item);
          items.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items:items,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public readKnowledgeItem(kid: number): Observable<KnowledgeItem> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');
    if (environment.mockdata) {
      return of(new KnowledgeItem());
    }
          
    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,Category,Title,Content');
    params = params.append('$expand', 'Tags');
    return this.http.get(`${this.apiUrl}KnowledgeItems(${kid})`, {
        headers,
        params,
      })
      .pipe(map(response => {
        const rsp = response as any;
        const kitem = new KnowledgeItem();
        kitem.parseData(rsp);
        return kitem;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public createKnowledgeItem(ki: KnowledgeItem): Observable<KnowledgeItem> {
    if (environment.mockdata) {
      return of(new KnowledgeItem());
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    const jdata = ki.generateString();
    return this.http.post(`${this.apiUrl}KnowledgeItems`, jdata, {
        headers
        // params,
      })
      .pipe(map(response => {
        const rsp = response as any;
        const kitem = new KnowledgeItem();
        kitem.parseData(rsp);
        return kitem;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
  public changeKnowledgeItem(ki: KnowledgeItem): Observable<KnowledgeItem> {
    if (environment.mockdata) {
      return of(new KnowledgeItem());
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    const jdata = ki.generateString(true);
    return this.http.put(`${this.apiUrl}KnowledgeItems(${ki.ID})`, jdata, {
        headers
        // params,
      })
      .pipe(map(response => {
        const rsp = response as any;
        const kitem = new KnowledgeItem();
        kitem.parseData(rsp);
        return kitem;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public getExerciseItems(): Observable<{ totalCount: number, items: ExerciseItem[]}> {
    if (environment.mockdata) {
      return of({
        totalCount: 0,
        items: []
      });
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType,CreatedAt');
    return this.http.get(`${this.apiUrl}ExerciseItems`, {
        headers,
        params,
      })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: ExerciseItem[] = [];
        ritems.forEach(item => {
          const rit: ExerciseItem = new ExerciseItem();
          rit.parseData(item);
          items.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public createExerciseItem(qbi: ExerciseItem): Observable<ExerciseItem> {
    if (environment.mockdata) {
      return of(new ExerciseItem());
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    const jdata = qbi.generateString();
    return this.http.post(`${this.apiUrl}ExerciseItems`, jdata, {
        headers,
      })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new ExerciseItem();
        rtn.parseData(rjs);
        return rtn;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public changeExerciseItem(qbi: ExerciseItem): Observable<ExerciseItem> {
    if (environment.mockdata) {
      return of(new ExerciseItem());
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    const jdata = qbi.generateString(true);
    return this.http.put(`${this.apiUrl}ExerciseItems(${qbi.ID})`, jdata, {
        headers,
      })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new ExerciseItem();
        rtn.parseData(rjs);
        return rtn;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public readExerciseItem(qbid: number): Observable<ExerciseItem> {
    if (environment.mockdata) {
      return of(new ExerciseItem());
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType,Content,CreatedAt,ModifiedAt');
    params = params.append('$expand', 'Tags,Answer');
    return this.http.get(`${this.apiUrl}ExerciseItems(${qbid})`, {
        headers,
        params,
      })
      .pipe(map(response => {
        const ei: ExerciseItem = new ExerciseItem();
        ei.parseData(response);
        return ei;
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
          const bodys: any = event.body;
          const body = bodys[0];
          result.next({
            delete_type: body.delete_type,
            delete_url: `${environment.apiurl_root}${body.delete_url}`,
            name: body.name,
            progress: 1,
            size: body.size,
            thumbnail_url: `${environment.apiurl_root}${body.thumbnail_url}`,
            type: body.type,
            url: `${environment.apiurl_root}${body.url}`,
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

  public getTagCounts(): Observable<{ totalCount: number, items: TagCount[]}> {
    if (environment.mockdata) {
      return of({ totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    // params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType');
    return this.http.get(`${this.apiUrl}TagCounts`, {
        headers,
        params,
      })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: TagCount[] = [];
        ritems.forEach(item => {
          const rit: TagCount = new TagCount();
          rit.parseData(item);
          items.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public getTags(term: string, reftype?: TagReferenceType): Observable<{ totalCount: number, items: Tag[]}> {
    if (environment.mockdata) {
      return of({totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$filter', `TagTerm eq '${term}'`);
    // params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType');
    return this.http.get(`${this.apiUrl}Tags`, {
        headers,
        params,
      })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: Tag[] = [];
        ritems.forEach(item => {
          const rit: Tag = new Tag();
          rit.parseData(item);
          items.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items,
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public getOverviewInfo(): Observable<OverviewInfo[]> {
    if (environment.mockdata) {
      return of([]);
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    // params = params.append('$top', '100');
    // params = params.append('$count', 'true');
    // params = params.append('$filter', `TagTerm eq '${term}'`);
    // params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType');
    return this.http.get(`${this.apiUrl}OverviewInfos`, {
        headers,
        params,
      })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: OverviewInfo[] = [];
        ritems.forEach(item => {
          const rit: OverviewInfo = new OverviewInfo();
          rit.parseData(item);
          items.push(rit);
        });

        return items;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
}
