/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, } from '@angular/common/http';
import { Observable, throwError, Subject, of, forkJoin } from 'rxjs';
import { map, catchError, mergeMap, flatMap, } from 'rxjs/operators';

import { ExerciseItem, ExerciseItemSearchResult, TagCount, Tag, KnowledgeItem, TagReferenceType, OverviewInfo,
  AwardRuleGroup, AwardRuleDetail, AwardRule, DailyTrace, AwardPoint, AwardPointReport, momentDateFormat,
  UserCollection, ExerciseItemUserScore, UserCollectionItem, AwardUser, InvitedUser, AwardUserView,
  UserHabit, UserHabitRecord, UserHabitPointsByUserDate, UserHabitPointsByUserHabitDate,
  UserHabitRecordView, UserHabitPointReport, UserHabitPoint,
} from '../models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ODataService {
  apiUrl = `${environment.apiurlRoot}/`;
  uploadUrl = `${environment.apiurlRoot}/api/ImageUpload`;

  // expertMode = false;
  private isMetadataLoaded = false;
  private metadataInfo = '';
  // Mockdata - User Detail
  private mockedUserDetail: InvitedUser | null = null;
  // Mockdata - knowledge item
  private mockedKnowledgeItem: KnowledgeItem[] = [];
  // Mockdata - exercise item
  private mockedExerciseItem: ExerciseItem[] = [];
  // Mockdata - user collection
  private mockedUserCollection: UserCollection[] = [];
  // Buffers
  bufferedKnowledgeItems: KnowledgeItem[] = [];
  bufferedExerciseItems: ExerciseItem[] = [];
  bufferedUserCollection: UserCollection[] = [];
  bufferedAwardUser: AwardUserView[] = [];
  bufferedAwardRuleGroup: AwardRuleGroup[] = [];
  bufferedUserHabit: UserHabit[] = [];
  bufferedUserHabitRecordView: UserHabitRecordView[] = [];
  private mockModeFailMsg = 'Cannot perform required opertion in mock mode';
  private expertModeFailMsg = 'Cannot perform required opertion, need Login';
  private contentType = 'Content-Type';
  private appJson = 'application/json';
  private strAccept = 'Accept';

  constructor(private http: HttpClient,
    private authService: AuthService) {
  }

  public getMetadata(forceReload?: boolean): Observable<any> {
    if (!this.isMetadataLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append(this.contentType, 'application/xml,application/json')
        .append(this.strAccept, 'text/html,application/xhtml+xml,application/xml');

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.status + '; ' + error.error + '; ' + error.message))));
    } else {
      return of(this.metadataInfo);
    }
  }

  //
  // Knowledge items
  //
  public getKnowledgeItems(top = 30, skip = 0, sort?: string, order?: string, filter?: string): Observable<{totalCount: number; items: KnowledgeItem[];}> {
    if (environment.mockdata && this.mockedKnowledgeItem.length > 0) {
      return of({
        totalCount: this.mockedKnowledgeItem.length,
        items: this.mockedKnowledgeItem
      });      
    }

    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
      catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message)))
    );  
  }

  public readKnowledgeItem(kid: number, forceLoad = false): Observable<KnowledgeItem> {
    if (environment.mockdata) {
      const idx = this.mockedKnowledgeItem.findIndex(val => val.ID === kid);
      if (idx !== -1) {
        return of(this.mockedKnowledgeItem[idx]);
      }
      return of(new KnowledgeItem());
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    const bufidx = this.bufferedKnowledgeItems.findIndex(val => val.ID === kid);
    if (!forceLoad && bufidx !== -1) {
      return of(this.bufferedKnowledgeItems[bufidx]);
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);;

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message)))
    );
  }

  public createKnowledgeItem(ki: KnowledgeItem): Observable<KnowledgeItem> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message)))
          );
  }

  public changeKnowledgeItem(ki: KnowledgeItem): Observable<KnowledgeItem> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
      catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public deleteKnowledgeItem(itemid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  //
  // Exercise items
  //
  public getExerciseItems(top = 30, skip = 0, sort?: string, order?: string, filter?: string): Observable<{ totalCount: number; items: ExerciseItem[] }> {
    if (environment.mockdata && this.mockedExerciseItem.length > 0) {
      return of({
        totalCount: this.mockedExerciseItem.length,
        items: this.mockedExerciseItem
      });
    }
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);;

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public createExerciseItem(qbi: ExerciseItem): Observable<ExerciseItem> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public changeExerciseItem(qbi: ExerciseItem): Observable<ExerciseItem> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public readExerciseItem(qbid: number, forceLoad = false): Observable<ExerciseItem> {
    if (environment.mockdata) {
      const idx = this.mockedExerciseItem.findIndex(val => val.ID === qbid);
      if (idx !== -1) {
        return of(this.mockedExerciseItem[idx]);
      }
      return of(new ExerciseItem());
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    const bufidx = this.bufferedExerciseItems.findIndex(val => val.ID === qbid);
    if (!forceLoad && bufidx !== -1) {
      return of(this.bufferedExerciseItems[bufidx]);
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public deleteExerciseItem(itemid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public searchExerciseItems(top = 30, skip = 0, filter?: string): Observable<{ totalCount: number; items: ExerciseItemSearchResult[] }> {
    // if (environment.mockdata && this.mockedExerciseItem.length > 0) {
    //   return of({
    //     totalCount: this.mockedExerciseItem.length,
    //     items: this.mockedExerciseItem
    //   });
    // }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
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
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public getTags(term: string, reftype?: TagReferenceType): Observable<{ totalCount: number; items: Tag[] }> {
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$top', '100');
    params = params.append('$count', 'true');
    let filter = `TagTerm eq '${term}'`;
    if (reftype === TagReferenceType.KnowledgeItem) {
      filter = `${filter} and RefType eq 'KnowledgeItem'`;
    } else if (reftype === TagReferenceType.ExerciseItem) {
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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public getOverviewInfo(): Observable<OverviewInfo[]> {
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

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
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  // User collection
  public getUserCollections(top = 30, skip = 0, sort?: string, filter?: string): Observable<{ totalCount: number; items: UserCollection[] }> {
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    params = params.append('$expand', 'Items');
    if (filter) {
      params = params.append('$filter', `${filter} and User eq '${this.authService.currentUserId}'`);
    } else {
      params = params.append('$filter', `User eq '${this.authService.currentUserId}'`);
    }
    const apiurl = `${this.apiUrl}UserCollections`;

    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        this.bufferedUserCollection = [];
        ritems.forEach(item => {
          const rit: UserCollection = new UserCollection();
          rit.parseData(item);
          this.bufferedUserCollection.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items: this.bufferedUserCollection,
        };
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public createUserCollection(coll: UserCollection): Observable<UserCollection> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = coll.writeJSONString();

    return this.http.post(`${this.apiUrl}UserCollections`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new UserCollection();
        rtn.parseData(rjs);

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public readUserCollection(collid: number, forceLoad = false): Observable<UserCollection> {
    if (environment.mockdata) {
      const idx = this.mockedUserCollection.findIndex(val => val.ID === collid);
      if (idx !== -1) {
        return of(this.mockedUserCollection[idx]);
      }
      return of(new UserCollection());
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let bufidx = -1;
    if (!forceLoad) {
      bufidx = this.bufferedUserCollection.findIndex(val => val.ID === collid);
      if (bufidx !== -1) {
        return of(this.bufferedUserCollection[bufidx]);
      }
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    // params = params.append('$select', 'ID,Category,Title,Content,CreatedAt,ModifiedAt');
    params = params.append('$expand', 'Items');
    // params = params.append('$filter', `User eq '${this.currentUser?.getUserId()}'`);

    return this.http.get(`${this.apiUrl}UserCollections(${collid})`, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rsp = response as any;
        const kitem = new UserCollection();
        kitem.parseData(rsp);

        if (bufidx === -1) {
          this.bufferedUserCollection.push(kitem);
        } else {
          this.bufferedUserCollection[bufidx] = kitem;
        }

        return kitem;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public addExerciseItemToCollection(collItems: UserCollectionItem[]): Observable<UserCollectionItem[]> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    const jdata: any = {
      User: this.authService.currentUserId,
      UserCollectionItems: []
    };

    collItems.forEach(ci => {
      jdata.UserCollectionItems.push(ci.writeJSONObject(true));
    });
    const params: HttpParams = new HttpParams();

    return this.http.post(`${this.apiUrl}UserCollectionItems/AddItemToCollectionEx`, jdata, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: UserCollectionItem[] = [];

        ritems.forEach(item => {
          const rit: UserCollectionItem = new UserCollectionItem();
          rit.parseData(item);
          items.push(rit);
        });

        return items;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public removeExerciseItemFromCollection(collItem: UserCollectionItem): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    const jdata: any = {
      User: this.authService.currentUserId,
      ID: collItem.ID,
      RefID: collItem.RefID,
      RefType: TagReferenceType[collItem.RefType]
    };
    const params: HttpParams = new HttpParams();

    return this.http.post(`${this.apiUrl}UserCollectionItems/RemoveItemFromCollection`, jdata, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = rjs.value as boolean;

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public addKnowledgeItemToCollection(collItems: UserCollectionItem[]): Observable<UserCollectionItem[]> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    const jdata: any = {
      User: this.authService.currentUserId,
      UserCollectionItems: []
    };
    collItems.forEach(ci => {
      jdata.UserCollectionItems.push(ci.writeJSONObject(true));
    });
    const params: HttpParams = new HttpParams();

    return this.http.post(`${this.apiUrl}UserCollectionItems/AddItemToCollectionEx`, jdata, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: UserCollectionItem[] = [];

        ritems.forEach(item => {
          const rit: UserCollectionItem = new UserCollectionItem();
          rit.parseData(item);
          items.push(rit);
        });

        return items;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public removeKnowledgeItemFromCollection(collItem: UserCollectionItem): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    const jdata: any = {
      User: this.authService.currentUserId,
      ID: collItem.ID,
      RefID: collItem.RefID,
      RefType: TagReferenceType[collItem.RefType]
    };
    const params: HttpParams = new HttpParams();
    return this.http.post(`${this.apiUrl}UserCollectionItems/RemoveItemFromCollection`, jdata, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = rjs.value as boolean;

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public deleteUserCollection(collid: number): Observable<any> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

      return this.http.delete(`${this.apiUrl}UserCollections(${collid})`, {
        headers,
      })
        .pipe(map(response => true),
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  // Exercise item user score
  public getExerciseItemUserScores(top = 30, skip = 0, filter?: string): Observable<{ totalCount: number; items: ExerciseItemUserScore[] }> {
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    if (filter) {
      params = params.append('$filter', `${filter} and User eq '${this.authService.currentUserId}'`);
    } else {
      params = params.append('$filter', `User eq '${this.authService.currentUserId}'`);
    }
    const apiurl = `${this.apiUrl}ExerciseItemUserScores`;

    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];
        const items: ExerciseItemUserScore[] = [];
        ritems.forEach(item => {
          const rit: ExerciseItemUserScore = new ExerciseItemUserScore();
          rit.parseData(item);
          items.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items,
        };
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public createExerciseItemUserScore(nscore: ExerciseItemUserScore): Observable<ExerciseItemUserScore> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = nscore.writeJSONString();

    return this.http.post(`${this.apiUrl}ExerciseItemUserScores`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new ExerciseItemUserScore();
        rtn.parseData(rjs);

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public deleteExerciseItemUserScore(scoreid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);;

      return this.http.delete(`${this.apiUrl}ExerciseItemUserScores(${scoreid})`, {
        headers,
      })
        .pipe(map(response => true),
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public getLastestExerciseItemUserScore(refid: number): Observable<ExerciseItemUserScore | null> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    const jdata = {
      User: this.authService.currentUserId,
      RefID: refid,
    };

    return this.http.post(`${this.apiUrl}ExerciseItemUserScores/LatestUserScore`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        if (rjs) {
          const rtn = new ExerciseItemUserScore();
          rtn.parseData(rjs);
          return rtn;
        }

        return null;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  ///
  /// Habit Builder
  ///

  // Habit
  public getUserHabits(top = 30, skip = 0, sort?: string, order?: string, filter?: string): Observable<{ totalCount: number; items: UserHabit[] }> {
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }
    // https://localhost:44355/UserHabits?$filter=TargetUser eq 'test2' and ValidFrom le 2021-11-25 and ValidTo ge 2021-11-25
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    params = params.append('$expand', 'Rules');
    if (sort) {
      if (sort === 'name') {
        params = params.append('$orderby', `Name ${order}`);
      }
    }
    if (filter) {
      params = params.append('$filter', filter);
    }
    const apiurl = `${this.apiUrl}UserHabits`;
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
        this.bufferedUserHabit = [];

        ritems.forEach(item => {
          const rit: UserHabit = new UserHabit();
          rit.parseData(item);
          this.bufferedUserHabit.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items: this.bufferedUserHabit,
        };
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public readUserHabit(hid: number, forceLoad = false): Observable<UserHabit> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let bufidx = -1;
    if (!forceLoad) {
      bufidx = this.bufferedUserHabit.findIndex(val => val.ID === hid);
      if (bufidx !== -1) {
        return of(this.bufferedUserHabit[bufidx]);
      }
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$expand', 'Rules');
    const apiurl = `${this.apiUrl}UserHabits(${hid})`;
    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rit: UserHabit = new UserHabit();
        rit.parseData(rjs);

        if (bufidx !== -1) {
          this.bufferedUserHabit[bufidx] = rit;
        }

        return rit;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public createUserHabit(grp: UserHabit): Observable<UserHabit> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = grp.writeJSONObject();
    return this.http.post(`${this.apiUrl}UserHabits`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new UserHabit();
        rtn.parseData(rjs);

        this.bufferedUserHabit.push(rtn);

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public deleteUserHabit(rid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

      return this.http.delete(`${this.apiUrl}UserHabits(${rid})`, {
        headers
      })
        .pipe(map(response => {
          const idx = this.bufferedUserHabit.findIndex(rg => rg.ID === rid);
          if (idx !== -1) {
            this.bufferedUserHabit.splice(idx, 1);
          }

          return true;
        }),
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  // Habit Record
  public getUserHabitRecords(top = 30, skip = 0): Observable<{ totalCount: number; items: UserHabitRecord[] }> {
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    //params = params.append('$expand', 'Rules');
    // params = params.append('$select',
    //   'ID,RuleType,TargetUser,Desp,ValidFrom,ValidTo,CountOfFactLow,CountOfFactHigh,DoneOfFact,TimeStart,TimeEnd,DaysFrom,DaysTo,Point');
    // if (filter) {
    //   params = params.append('$filter', filter);
    // }
    const apiurl = `${this.apiUrl}UserHabitRecords`;
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
        let arRecords: UserHabitRecord[] = [];
        ritems.forEach(item => {
          const rit: UserHabitRecord = new UserHabitRecord();
          rit.parseData(item);
          arRecords.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items: arRecords,
        };
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public getUserHabitRecordViews(top = 30, skip = 0, sort?: string, order?: string, filter?: string): Observable<{ totalCount: number; items: UserHabitRecordView[] }> {
    if (!this.authService.isAuthenticated) {
      return of({totalCount: 0, items: []});
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$top', top.toString());
    params = params.append('$skip', skip.toString());
    params = params.append('$count', 'true');
    if (sort) {
      if (sort === 'recordDate') {
        params = params.append('$orderby', `RecordDate ${order}`);
      }
    }
    if (filter) {
      params = params.append('$filter', filter);
    }

    const apiurl = `${this.apiUrl}UserHabitRecordViews`;
    return this.http.get(apiurl, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const ritems = rjs.value as any[];

        this.bufferedUserHabitRecordView = [];

        ritems.forEach(item => {
          const rit: UserHabitRecordView = new UserHabitRecordView();
          rit.parseData(item);
          this.bufferedUserHabitRecordView.push(rit);
        });

        return {
          totalCount: rjs['@odata.count'],
          items: this.bufferedUserHabitRecordView,
        };
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public createUserHabitRecord(record: UserHabitRecord): Observable<UserHabitRecord> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = record.writeJSONObject();
    return this.http.post(`${this.apiUrl}UserHabitRecords`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new UserHabitRecord();
        rtn.parseData(rjs);

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }

  public deleteUserHabitRecord(habitid: number, recordDate: string, subID: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

      return this.http.delete(`${this.apiUrl}UserHabitRecords(Habitid=${habitid},RecordDate=${recordDate},SubID=${subID})`, {
        headers,
      })
        .pipe(map(response => {
          return true;
        }),
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  // Points from Habit
  public getHabitOpeningPointsByUserDate(usr: string, daysbackto: number): Observable<number> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = {
      User: usr,
      DaysBackTo: daysbackto,
    };

    return this.http.post(`${this.apiUrl}UserHabitPointsByUserDates/GetOpeningPoint`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        if (rjs) {
          return rjs.value as number;
        }

        return 0;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public getHabitPointsByUserDateReport(filter: string): Observable<UserHabitPointsByUserDate[]> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filter);

    return this.http.get(`${this.apiUrl}UserHabitPointsByUserDates`, {
      headers,
      params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtns: UserHabitPointsByUserDate[] = [];
        const ritems = rjs.value as any[];
        ritems.forEach(item => {
          const rit: UserHabitPointsByUserDate = new UserHabitPointsByUserDate();
          rit.parseData(item);
          rtns.push(rit);
        });

        return rtns;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public getHabitPointsByUserHabitDates(): Observable<UserHabitPointsByUserHabitDate[]> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

      return this.http.get(`${this.apiUrl}UserHabitPointsByUserHabitDates`, {
        headers,
      })
        .pipe(map(response => {
          const rjs = response as any;
          const rtns: UserHabitPointsByUserHabitDate[] = [];
          const ritems = rjs.value as any[];
          ritems.forEach(item => {
            const rit: UserHabitPointsByUserHabitDate = new UserHabitPointsByUserHabitDate();
            rit.parseData(item);
            rtns.push(rit);
          });

          return rtns;
        }),
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  // Points from manual
  public getUserHabitPointReports(filter: string): Observable<UserHabitPointReport[]> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filter);

    return this.http.get(`${this.apiUrl}UserHabitPointReports`, {
      headers, params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtns: UserHabitPointReport[] = [];
        const ritems = rjs.value as any[];
        ritems.forEach(item => {
          const rit: UserHabitPointReport = new UserHabitPointReport();
          rit.parseData(item);
          rtns.push(rit);
        });

        return rtns;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public getUserOpeningPointReport(usr: string, daysbackto: number): Observable<number> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = {
      User: usr,
      DaysBackTo: daysbackto,
    };
    return this.http.post(`${this.apiUrl}UserHabitPoints/GetOpeningPoint`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        if (rjs) {
          return rjs.value as number;
        }

        return 0;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public createHabitPoint(point: UserHabitPoint): Observable<UserHabitPoint> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    const jdata = point.writeJSONObject();

    return this.http.post(`${this.apiUrl}UserHabitPoints`, jdata, {
      headers,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtn = new UserHabitPoint();
        rtn.parseData(rjs);

        // this.bufferedUserHabit.push(rtn);

        return rtn;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public getHabitPoints(filter: string): Observable<UserHabitPoint[]> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filter);
    return this.http.get(`${this.apiUrl}UserHabitPoints`, {
      headers, params,
    })
      .pipe(map(response => {
        const rjs = response as any;
        const rtns: UserHabitPoint[] = [];
        const ritems = rjs.value as any[];
        ritems.forEach(item => {
          const rit: UserHabitPoint = new UserHabitPoint();
          rit.parseData(item);
          rtns.push(rit);
        });

        return rtns;
      }),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
  public deleteHabitPoint(pid: number): Observable<boolean> {
    if (environment.mockdata) {
      return throwError(() => new Error(this.mockModeFailMsg));
    }
    if (!this.authService.isAuthenticated) {
      return throwError(() => new Error(this.expertModeFailMsg));
    }
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append(this.contentType, this.appJson)
      .append(this.strAccept, this.appJson)
      .append('Authorization', 'Bearer ' + this.authService.accessToken);

      return this.http.delete(`${this.apiUrl}UserHabitPoints(${pid})`, {
        headers,
      })
        .pipe(map(response => {
          return true;
        }),
          catchError((error: HttpErrorResponse) => throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message))));
  }
}

