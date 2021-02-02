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
  // Mockdata - knowledge item
  private mockedKnowledgeItem: KnowledgeItem[] = [];
  // Mockdata - exercise item
  private mockedExerciseItem: ExerciseItem[] = [];

  constructor(private http: HttpClient,
    ) { }

  public getMetadata(forceReload?: boolean): Observable<any> {
    if (!this.isMetadataLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/xml,application/json')
                .append('Accept', 'text/html,application/xhtml+xml,application/xml');

      let apiurl = `${this.apiUrl}$metadata`;
      if (environment.mockdata) {
        apiurl = `${environment.basehref}assets/mockdata/metadata.xml`;
      }
      return this.http.get(apiurl, {
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

    if (environment.mockdata && this.mockedKnowledgeItem.length > 0) {
      return of({
        totalCount: this.mockedKnowledgeItem.length,
        items: this.mockedKnowledgeItem
      });
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,Category,Title,CreatedAt,ModifiedAt');
    let apiurl = `${this.apiUrl}KnowledgeItems`;
    if (environment.mockdata) {
      apiurl = `${environment.basehref}assets/mockdata/knowledge-items.json`;
      params = new HttpParams();
    }
    return this.http.get(apiurl, {
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
        if (environment.mockdata) {
          this.mockedKnowledgeItem = items.slice();
        }

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
    if (environment.mockdata) {
      const idx = this.mockedKnowledgeItem.findIndex(val => val.ID === kid);
      if (idx !== -1) {
        return of(this.mockedKnowledgeItem[idx]);
      }
      return of(new KnowledgeItem());
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');
          
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
      return throwError('Cannot create in mock mode');
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
      return throwError('Cannot change in mock mode');
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
    if (environment.mockdata && this.mockedExerciseItem.length > 0) {
      return of({
        totalCount: this.mockedExerciseItem.length,
        items: this.mockedExerciseItem
      });
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');
              
    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType,CreatedAt');
    let apiurl = `${this.apiUrl}ExerciseItems`;
    if (environment.mockdata) {
      apiurl = `${environment.basehref}assets/mockdata/exercise-items.json`;
      params = new HttpParams();
    }

    return this.http.get(apiurl, {
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

        if (environment.mockdata) {
          this.mockedExerciseItem = items.slice();
        }

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
      return throwError('Cannot create in mock mode');
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
      return throwError('Cannot change in mock mode');
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
      const idx = this.mockedExerciseItem.findIndex(val => val.ID === qbid);
      if (idx !== -1) {
        return of(this.mockedExerciseItem[idx]);
      }
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
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');

    let apiurl = `${this.apiUrl}TagCounts`;
    if (environment.mockdata) {
      apiurl = `${environment.basehref}assets/mockdata/tag-counts.json`;
      params = new HttpParams();
    }

    return this.http.get(apiurl, {
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
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    params = params.append('$filter', `TagTerm eq '${term}'`);

    let apiurl = `${this.apiUrl}Tags`;
    if (environment.mockdata) {
      apiurl = `${environment.basehref}assets/mockdata/tags.json`;
      params = new HttpParams();
    }
    return this.http.get(apiurl, {
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
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
              .append('Accept', 'application/json');

    let apiurl = `${this.apiUrl}OverviewInfos`;
    if (environment.mockdata) {
      apiurl = `${environment.basehref}assets/mockdata/overview-infos.json`;      
    }
    return this.http.get(apiurl, {
        headers
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
