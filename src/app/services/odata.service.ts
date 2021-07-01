/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ExerciseItem, ExerciseItemSearchResult, TagCount, Tag, KnowledgeItem, TagReferenceType, OverviewInfo,
  AwardRule, DailyTrace, AwardPoint, } from '../models';
import { environment } from '../../environments/environment';

export interface PreviewObject {
  refType: TagReferenceType;
  refId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ODataService {
  apiUrl = `${environment.apiurlRoot}/`;
  uploadUrl = `${environment.apiurlRoot}/api/ImageUpload`;

  private isMetadataLoaded = false;
  private metadataInfo = '';
  // Mockdata - knowledge item
  private mockedKnowledgeItem: KnowledgeItem[] = [];
  // Mockdata - exercise item
  private mockedExerciseItem: ExerciseItem[] = [];
  // Preview objects
  previewObjList: PreviewObject[] = [];
  bufferedKnowledgeItems: KnowledgeItem[] = [];
  bufferedExerciseItems: ExerciseItem[] = [];

  constructor(private http: HttpClient,) { }

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
        catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
    } else {
      return of(this.metadataInfo);
    }
  }

  //
  // Knowledge items
  //
  public getKnowledgeItems(top = 30, skip = 0, sort?: string, order?: string, filter?: string): Observable<{
    totalCount: number;
    items: KnowledgeItem[];}> {

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
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    if (sort) {
      if (sort === 'createdat') {
        params = params.append('$orderby', `CreatedAt ${order}`);
      }
    }
    params = params.append('$select', 'ID,Category,Title,CreatedAt,ModifiedAt');
    if (filter) {
      params = params.append('$filter', filter);
    }
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
          items
        };
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  public readKnowledgeItem(kid: number, forceLoad = false): Observable<KnowledgeItem> {
    if (environment.mockdata) {
      const idx = this.mockedKnowledgeItem.findIndex(val => val.ID === kid);
      if (idx !== -1) {
        return of(this.mockedKnowledgeItem[idx]);
      }
      return of(new KnowledgeItem());
    }

    const bufidx = this.bufferedKnowledgeItems.findIndex(val => val.ID === kid);
    if (!forceLoad && bufidx !== -1) {
      return of(this.bufferedKnowledgeItems[bufidx]);
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,Category,Title,Content,CreatedAt,ModifiedAt');
    params = params.append('$expand', 'Tags');
    return this.http.get(`${this.apiUrl}KnowledgeItems(${kid})`, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rsp = response as any;
        const kitem = new KnowledgeItem();
        kitem.parseData(rsp);

        if (bufidx === -1) {
          this.bufferedKnowledgeItems.push(kitem);
        } else {
          this.bufferedKnowledgeItems[bufidx] = kitem;
        }

        return kitem;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
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
        if (ki.Tags.length > 0) {
          kitem.Tags = ki.Tags;
        }

        // Add to buffer
        this.bufferedKnowledgeItems.push(kitem);

        return kitem;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message)
      ));
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
      })
      .pipe(map(response => {
        const bufidx = this.bufferedKnowledgeItems.findIndex(val => val.ID === ki.ID);
        if (bufidx === -1) {
          this.bufferedKnowledgeItems.push(ki);
        } else {
          this.bufferedKnowledgeItems[bufidx] = ki;
        }

        return ki;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message)
      ));
  }

  public deleteKnowledgeItem(itemid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError('Cannot delete in mock mode');
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    return this.http.delete(`${this.apiUrl}KnowledgeItems(${itemid})`, {
      headers
    })
      .pipe(map(response => {
        // Clear it from the buffer
        const bufidx = this.bufferedKnowledgeItems.findIndex(val => val.ID === itemid);
        if (bufidx !== -1) {
          this.bufferedKnowledgeItems.splice(bufidx, 1);
        }

        return true;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message)
      ));
  }

  //
  // Exercise items
  //
  public getExerciseItems(top = 30, skip = 0, sort?: string,
    order?: string, filter?: string): Observable<{ totalCount: number; items: ExerciseItem[] }> {
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
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    if (sort) {
      if (sort === 'createdat') {
        params = params.append('$orderby', `CreatedAt ${order}`);
      }
    }
    params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType,CreatedAt');
    if (filter) {
      params = params.append('$filter', filter);
    }
    params = params.append('$expand', 'Tags');
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
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
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
        if (qbi.Tags.length > 0) {
          rtn.Tags = qbi.Tags.slice();
        }
        if (qbi.Answer) {
          rtn.Answer = qbi.Answer;
        }

        // Add to buffer
        this.bufferedExerciseItems.push(rtn);

        return rtn;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
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
        const bufidx = this.bufferedExerciseItems.findIndex(val => val.ID === qbi.ID);
        if (bufidx === -1) {
          this.bufferedExerciseItems.push(qbi);
        } else {
          this.bufferedExerciseItems[bufidx] = qbi;
        }

        return qbi;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  public readExerciseItem(qbid: number, forceLoad = false): Observable<ExerciseItem> {
    if (environment.mockdata) {
      const idx = this.mockedExerciseItem.findIndex(val => val.ID === qbid);
      if (idx !== -1) {
        return of(this.mockedExerciseItem[idx]);
      }
      return of(new ExerciseItem());
    }

    const bufidx = this.bufferedExerciseItems.findIndex(val => val.ID === qbid);
    if (!forceLoad && bufidx !== -1) {
      return of(this.bufferedExerciseItems[bufidx]);
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

        if (bufidx === -1) {
          this.bufferedExerciseItems.push(ei);
        } else {
          this.bufferedExerciseItems[bufidx] = ei;
        }

        return ei;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  public deleteExerciseItem(itemid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError('Cannot delete in mock mode');
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    return this.http.delete(`${this.apiUrl}ExerciseItems(${itemid})`, {
      headers
    })
      .pipe(map(response => {
        // Clear it from the buffer
        const bufidx = this.bufferedExerciseItems.findIndex(val => val.ID === itemid);
        if (bufidx !== -1) {
          this.bufferedExerciseItems.splice(bufidx, 1);
        }

        return true;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message)
      ));
  }
  public searchExerciseItems(top = 30, skip = 0, filter?: string): Observable<{ totalCount: number; items: ExerciseItemSearchResult[] }> {
    // if (environment.mockdata && this.mockedExerciseItem.length > 0) {
    //   return of({
    //     totalCount: this.mockedExerciseItem.length,
    //     items: this.mockedExerciseItem
    //   });
    // }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    params = params.append('$select', 'ID,KnowledgeItemID,ExerciseType,Tags');
    if (filter) {
      params = params.append('$filter', filter);
    }
    //params = params.append('$expand', 'Tags');
    let apiurl = `${this.apiUrl}ExerciseItemWithTagViews`;
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
        const items: ExerciseItemSearchResult[] = [];
        ritems.forEach(item => {
          const rit: ExerciseItemSearchResult = new ExerciseItemSearchResult();
          rit.parseData(item);
          items.push(rit);
        });

        // TBD: Mock data
        // if (environment.mockdata) {
        //   this.mockedExerciseItem = items.slice();
        // }

        return {
          totalCount: rjs['@odata.count'],
          items,
        };
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  // Award Rule
  public getAwardRules(top = 30, skip = 0, sort?: string, filter?: string):
    Observable<{ totalCount: number; items: AwardRule[] }> {
    // if (environment.mockdata && this.mockedExerciseItem.length > 0) {
    //   return of({
    //     totalCount: this.mockedExerciseItem.length,
    //     items: this.mockedExerciseItem
    //   });
    // }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    params = params.append('$select',
      'ID,RuleType,TargetUser,Desp,ValidFrom,ValidTo,CountOfFactLow,CountOfFactHigh,DoneOfFact,TimeStart,TimeEnd,DaysFrom,DaysTo,Point');
    if (filter) {
      params = params.append('$filter', filter);
    }
    const apiurl = `${this.apiUrl}AwardRules`;
    // if (environment.mockdata) {
    //   apiurl = `${environment.basehref}assets/mockdata/exercise-items.json`;
    //   params = new HttpParams();
    // }

    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: AwardRule[] = [];
        ritems.forEach(item => {
          const rit: AwardRule = new AwardRule();
          rit.parseData(item);
          items.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items,
        };
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  // Daily trace
  public getDailyTrace(top = 30, skip = 0, sort?: string, filter?: string):
    Observable<{ totalCount: number; items: DailyTrace[] }> {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

      let params: HttpParams = new HttpParams();
      params = params.append('$top', top.toString());
      params = params.append('$skip', skip.toString());
      params = params.append('$count', 'true');
      params = params.append('$select',
        'RecordDate,TargetUser,SchoolWorkTime,GoToBedTime,HomeWorkCount,BodyExerciseCount,ErrorsCollection,HandWriting,CleanDesk,HouseKeepingCount,PoliteBehavior,Comment');
      if (filter) {
        params = params.append('$filter', filter);
      }
      const apiurl = `${this.apiUrl}DailyTraces`;

      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map(response => {
          const rjs = response as any;
          const ritems = rjs.value as any[];
          const items: DailyTrace[] = [];
          ritems.forEach(item => {
            const rit: DailyTrace = new DailyTrace();
            rit.parseData(item);
            items.push(rit);
          });

          return {
            totalCount: rjs['@odata.count'],
            items,
          };
        }),
        catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  public simulatePoint(trace: DailyTrace): Observable<AwardPoint[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    const params = new HttpParams();
    const apiurl = `${this.apiUrl}DailyTraces/SimulatePoints`;

    const jdata = {
      dt: trace.writeJSONObject()
    };
    return this.http.post(apiurl, jdata, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: AwardPoint[] = [];
        ritems.forEach(item => {
          const rit: AwardPoint = new AwardPoint();
          rit.parseData(item);
          items.push(rit);
        });

        return items;
      }),
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  // Award points
  public getAwardPoints(top = 30, skip = 0, sort?: string, filter?: string):
    Observable<{ totalCount: number; items: AwardPoint[] }> {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

      let params: HttpParams = new HttpParams();
      params = params.append('$top', top.toString());
      params = params.append('$skip', skip.toString());
      params = params.append('$count', 'true');
      params = params.append('$select',
        'ID,RecordDate,TargetUser,MatchedRuleID,CountOfDay,Point,Comment');
      if (filter) {
        params = params.append('$filter', filter);
      }
      const apiurl = `${this.apiUrl}AwardPoints`;

      return this.http.get(apiurl, {
        headers,
        params,
      })
        .pipe(map(response => {
          const rjs = response as any;
          const ritems = rjs.value as any[];
          const items: AwardPoint[] = [];
          ritems.forEach(item => {
            const rit: AwardPoint = new AwardPoint();
            rit.parseData(item);
            items.push(rit);
          });

          return {
            totalCount: rjs['@odata.count'],
            items,
          };
        }),
        catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  // File upload
  public uploadFiles(files: Set<File>): { [key: string]: { result: Observable<any> } } {

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
            delete_url: `${environment.apiurlRoot}${body.delete_url}`,
            name: body.name,
            progress: 1,
            size: body.size,
            thumbnail_url: `${environment.apiurlRoot}${body.thumbnail_url}`,
            type: body.type,
            url: `${environment.apiurlRoot}${body.url}`,
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

  public getTagCounts(): Observable<{ totalCount: number; items: TagCount[] }> {
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
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }

  public getTags(term: string, reftype?: TagReferenceType): Observable<{ totalCount: number; items: Tag[] }> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json');

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    let filter = `TagTerm eq '${term}'`;
    if (reftype === TagReferenceType.KnowledgeItem) {
      filter = `${filter} and RefType eq 'KnowledgeItem'`;
    } else if(reftype === TagReferenceType.ExerciseItem) {
      filter = `${filter} and RefType eq 'ExerciseItem'`;
    }
    params = params.append('$filter', filter);

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
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
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
      catchError((error: HttpErrorResponse) => throwError(error.statusText + '; ' + error.error + '; ' + error.message) ));
  }
}
