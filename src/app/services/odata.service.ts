import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { KnowledgeItem,
// QuestionBankItem, KnowledgeQuestionbankLink, Learnuser,
} from '../models';
import { Observable, throwError } from 'rxjs';
import { map, catchError, } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OdataService {
  private countKnowledgeItems: number;
  private countQuestionBank: number;
  private countLearnuser: number;
  constructor(private http: HttpClient) {
    this.countKnowledgeItems = 0;
    this.countQuestionBank = 0;
    this.countLearnuser = 0;
  }

  get KnowledgeItemsCount(): number {
    return this.countKnowledgeItems;
  }
  get QuestionBankCount(): number {
    return this.countQuestionBank;
  }
  get LearnUserCount(): number {
    return this.countLearnuser;
  }

  public createKnowledge(knowledge: KnowledgeItem): Observable<KnowledgeItem> {
    // Create knowledge
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

    return this.http.post(environment.ODataUrl + 'knowledges',
      knowledge.toJsonFormat(), {
        headers,
      }).pipe(
        map((response: HttpResponse<any>) => {
          const ki: KnowledgeItem = new KnowledgeItem();
          ki.fromJsonFormat(response);
          return ki;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  public fetchAllKnowledges(top?: number, skip?: number): Observable<KnowledgeItem[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');
    const ltop = top ? top : 100;
    const lskip = skip ? skip : 0;

    return this.http.get(
      environment.ODataUrl + `knowledges?$count=true&$top=${ltop}&$skip=${lskip}&$select=Id, Category, Name, CanGenerate`, {
        headers,
      }).pipe(map((response: HttpResponse<any>) => {
        this.countKnowledgeItems = +(response as any)['@odata.count'];
        const vals: any[] = (response as any).value;
        const arItems: KnowledgeItem[] = [];
        vals.forEach((vitem: any) => {
          const kitem: KnowledgeItem = new KnowledgeItem();
          kitem.fromJsonFormat(vitem);
          arItems.push(kitem);
        });

        return arItems;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public fetchKnowledgesViaBatch(top?: number, skip?: number): Observable<any> {
    const endpoint = environment.ODataUrl + '$batch';
    const batchUuid = this.getUuid();
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', `multipart/mixed; boundary=${batchUuid}`);

    let reqbody = `--${batchUuid}`;
    reqbody += `
Content-Type: application/http
Content-Transfer-Encoding:binary

GET knowledges?$count=true HTTP/1.1
Accept: application/json;odata.metadata=minimal

`;

    reqbody += `--${batchUuid}`;
    reqbody += `
Content-Type: application/http
Content-Transfer-Encoding:binary

GET knowledges?$top=${top}&skip=${skip}&$select=Id, Name HTTP/1.1
Accept: application/json;

`;
    reqbody += `--${batchUuid}--`;

    return this.http.post(endpoint, reqbody, {
        headers,
      });
  }

  public readKnowledge(kid: number): Observable<KnowledgeItem> {
    // Read knowledge
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

    return this.http.get(environment.ODataUrl + 'knowledges(' + kid.toString() + ')', {
        headers,
      }).pipe(map((response: HttpResponse<any>) => {
        const ki: KnowledgeItem = new KnowledgeItem();
        ki.fromJsonFormat(response);
        return ki;
      }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
  }

/*
  public fetchAllQuestionBank(top?: number, skip?: number) {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');
    const ltop = top ? top : 100;
    const lskip = skip ? skip : 0;

    return this.http.get(environment.ODataUrl + `questionbanks?$count=true&$top=${ltop}&$skip=${lskip}&$select=Id, Category, BriefCont`, {
        headers,
      }).pipe(map((response: HttpResponse<any>) => {
        this.countQuestionBank = +(response as any)['@odata.count'];
        const vals: any[] = (response as any).value;
        const arItems: QuestionBankItem[] = [];
        vals.forEach((vitem: any) => {
          const qbitem: QuestionBankItem = new QuestionBankItem();
          qbitem.fromJsonFormat(vitem);
          arItems.push(qbitem);
        });

        return arItems;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  public readQuestionbank(qbid: number): Observable<QuestionBankItem> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

    return this.http.get(environment.ODataUrl + 'questionbanks(' + qbid.toString() + ')?$expand=Qbklink', {
        headers,
      }).pipe(map((response: HttpResponse<any>) => {
        const ki: QuestionBankItem = new QuestionBankItem();
        ki.fromJsonFormat(response);
        return ki;
      }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
  }
  public createQuestionbank(qb: QuestionBankItem): Observable<QuestionBankItem> {
    // Create question bank
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

    return this.http.post(environment.ODataUrl + 'questionbanks',
      qb.toJsonFormat(), {
        headers,
      }).pipe(
        map((response: HttpResponse<any>) => {
          const ki: QuestionBankItem = new QuestionBankItem();
          ki.fromJsonFormat(response);
          return ki;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  public createKnowledgeQuestionbankLink(link: KnowledgeQuestionbankLink): Observable<KnowledgeQuestionbankLink> {
    // Create knowledge-question bank link
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');

    return this.http.post(environment.ODataUrl + 'Qbklinks',
      link.toJsonFormat(), {
        headers,
      }).pipe(
        map((response: HttpResponse<any>) => {
          const ki: KnowledgeQuestionbankLink = new KnowledgeQuestionbankLink();
          ki.fromJsonFormat(response);
          return ki;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        })
      );
  }

  public fetchAllLearnuser(top?: number, skip?: number): Observable<Learnuser[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
        .append('Accept', 'application/json');
    const ltop = top ? top : 100;
    const lskip = skip ? skip : 0;

    return this.http.get(environment.ODataUrl + `quizusers?$count=true&$top=${ltop}&$skip=${lskip}&$select=UserId,DisplayAs,Others`, {
        headers,
      }).pipe(map((response: HttpResponse<any>) => {
        this.countLearnuser = +(response as any)['@odata.count'];
        const vals: any[] = (response as any).value;
        const arItems: Learnuser[] = [];
        vals.forEach((vitem: any) => {
          const qbitem: Learnuser = new Learnuser();
          qbitem.fromJsonFormat(vitem);
          arItems.push(qbitem);
        });

        return arItems;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }
*/
//   public async fetch(url: URL) {
//     const req = new ORequest(url, {
//       ...this.batchConfig,
//       body: this.batchBody,
//       method: "POST",
//     });
//     const res: Response = await req.fetch;
//     if (res.status === 200) {
//       const data = await res.text();
//       return this.parseResponse(data, res.headers.get("Content-Type"));
//     } else {
//       // check if return is JSON
//       try {
//         const error = await res.json();
//         throw { res, error };
//       } catch (ex) {
//         throw res;
//       }
//     }
//   }

//   public parseResponse(responseData: string, contentTypeHeader: string): any {
//     const headers = contentTypeHeader.split("boundary=");
//     const boundary = headers[headers.length - 1];
//     const splitData = responseData.split(`--${boundary}`);
//     splitData.shift();
//     splitData.pop();
//     const parsedData = splitData.map((data) => {
//       const dataSegments = data.trim().split("\r\n\r\n");
//       if (dataSegments.length === 0 || dataSegments.length > 3) {
//         // we are unable to parse -> return all
//         return data;
//       } else if (dataSegments.length === 3) {
//         // if length >= 3 we have a body, try to parse if JSON and return that!
//         try {
//           const parsed = JSON.parse(dataSegments[2]);
//           const hasFragment = parsed[this.batchConfig.fragment];
//           return hasFragment || parsed;
//         } catch (ex) {
//           return dataSegments[2];
//         }
//       } else {
//         // it seems like we have no body, return the status code
//         return +dataSegments[1].split(" ")[1];
//       }
//     });
//     return parsedData;
//   }

//   /**
//    * If we determine a changset (POST, PUT, PATCH) we initalize a new
//    * OBatch instance for it.
//    */
//   private checkForChangset(resources: ORequest[], query: OdataQuery) {
//     const changeRes = this.getChangeResources(resources);

//     if (this.changeset) {
//       this.batchBody += `
// Content-Type: multipart/mixed; boundary=${this.batchUid}
// --${this.batchUid}`;
//     } else if (changeRes.length > 0) {
//       this.batchBody = `--${this.batchUid}`;
//       this.batchBody += new OBatch(
//         changeRes,
//         this.batchConfig,
//         query,
//         true,
//       ).batchBody;
//       resources = this.getGETResources(resources);
//     } else {
//       this.batchBody = `--${this.batchUid}`;
//     }
//     return resources;
//   }

//   private getGETResources(resources: ORequest[]): ORequest[] {
//     return resources.filter((req) => req.config.method === "GET");
//   }

//   private getChangeResources(resources: ORequest[]): ORequest[] {
//     return resources.filter((req) => req.config.method !== "GET");
//   }

//   private getBody(req: ORequest) {
//     if (req.config.body) {
//       return `
//       ${req.config.body}
//       `;
//     }
//     return "";
//   }

  private getUuid() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
    });
    return `batch_${uuid}`;
  }
}
