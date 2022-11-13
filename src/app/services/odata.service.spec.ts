import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ODataService } from './odata.service';
import { environment } from 'src/environments/environment';
import { ExerciseItem, InvitedUser, KnowledgeItem, UserCollection, UserHabit } from '../models';
import { FakeData } from 'src/testing';
import { AuthService } from './auth.service';

describe('ODataService', () => {
  let fakeData: FakeData = new FakeData();
  let service: ODataService;
  let httpTestingController: HttpTestingController;
  let userDetail: InvitedUser;

  beforeAll(() => {
    fakeData.buildCurrentUserDetail();
    fakeData.buildKnowledgeItems();
  });

  beforeEach(() => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authStub}
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ODataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMetadata', () => {
    let callurl = `${environment.apiurlRoot}/$metadata`;
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected metadata (called once)', () => {
      service.getMetadata().subscribe({
        next: val => {
          expect(val).toBeTruthy();
        },
        error: err => {
          expect(err).toBeFalsy();
        }
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });

      // Respond with the mock data
      req.flush('Metadata');
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.getMetadata().subscribe({
        next: val => {
          expect(val).toBeTruthy();
        },
        error: err => {
          expect(err).toContain(msg);
        }
      });

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected metadata (called multiple times)', () => {
      // First call
      service.getMetadata().subscribe({
        next: val => {},
        error: err => {}
      });

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });

      // Respond with the mock data
      req.flush('Metadata');
      httpTestingController.verify();

      // Second call
      service.getMetadata().subscribe({
        next: val => {},
        error: err => {}
      });
      let requests = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });
      expect(requests.length).toEqual(0);

      // Third call
      service.getMetadata().subscribe({
        next: val => {},
        error: err => {}
      });
      requests = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });
      expect(requests.length).toEqual(0);

      // Forth call, with forceReload
      service.getMetadata(true).subscribe({
        next: val => {},
        error: err => {}
      });
      const req2: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET'
          && requrl.url === callurl;
      });
      httpTestingController.verify();
    });
  });

  describe('getKnowledgeItems', () => {
    let callurl = `${environment.apiurlRoot}/KnowledgeItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      service.getKnowledgeItems().subscribe({
        next: (val: {totalCount: number, items: KnowledgeItem[]}) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: err => {
          expect(err).toBeFalsy();
        }
      });
    });

    describe('After user login', () => {      
      beforeEach(() => {
      });

      it('should return expected items', () => {
        service.getKnowledgeItems().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl
            && requrl.params.has('$count');
          });
        expect(req.request.params.get('$count')).toEqual('true');
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [{
            ID: 1,
            Title: 'Test1',
            Content: 'Test1'
          }],
        });
      });

      it('should add parameter', () => {
        service.getKnowledgeItems(100, 20, 'createdat', 'asc', `Title eq 'a'`).subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
          });
        expect(req.request.params.get('$count')).toEqual('true');
        expect(req.request.params.get('$top')).toEqual('100');
        expect(req.request.params.get('$skip')).toEqual('20');
        expect(req.request.params.get('$orderby')).toEqual('CreatedAt asc');
        expect(req.request.params.get('$filter')).toEqual(`Title eq 'a'`);
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 0,
          value: [],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getKnowledgeItems().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toContain(msg);
          }
        });

        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('readKnowledgeItem', () => {
    let callurl = `${environment.apiurlRoot}/KnowledgeItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      service.readKnowledgeItem(1).subscribe({
        next: (val: KnowledgeItem) => {
          expect(val).toBeFalsy();
        },
        error: err => {
          expect(err).toBeTruthy();
          //expect(err).toContain(service.expertModeFailMsg);
        }
      });
    });
  });

  describe('getExerciseItems', () => {
    let callurl = `${environment.apiurlRoot}/ExerciseItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      service.getExerciseItems().subscribe({
        next: (val: {totalCount: number, items: ExerciseItem[]}) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: err => {
          expect(err).toBeFalsy();
        }
      });
    });

    describe('After user login', () => {      
      beforeEach(() => {
      });

      it('should return expected items', () => {
        service.getExerciseItems().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl
            && requrl.params.has('$count');
          });
        expect(req.request.params.get('$count')).toEqual('true');
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [{
            ID: 1,
            Content: 'test1'
          }],
        });
      });

      it('should add parameter', () => {
        service.getExerciseItems(100, 20, 'createdat', 'asc', `Title eq 'a'`).subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
          });
        expect(req.request.params.get('$count')).toEqual('true');
        expect(req.request.params.get('$top')).toEqual('100');
        expect(req.request.params.get('$skip')).toEqual('20');
        expect(req.request.params.get('$orderby')).toEqual('CreatedAt asc');
        expect(req.request.params.get('$filter')).toEqual(`Title eq 'a'`);
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 0,
          value: [],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getExerciseItems().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toContain(msg);
          }
        });

        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getUserCollections', () => {
    let callurl = `${environment.apiurlRoot}/UserCollections`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      service.getUserCollections().subscribe({
        next: (val: {totalCount: number, items: UserCollection[]}) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: err => {
          expect(err).toBeFalsy();
        }
      });
    });

    describe('After user login', () => {      
      beforeEach(() => {
      });

      it('should return expected data', () => {
        service.getUserCollections().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl
            && requrl.params.has('$count');
          });
        expect(req.request.params.get('$count')).toEqual('true');
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [{
            ID: 1,
            User: 'User1',
            Name: 'Coll 1'
          }],
        });
      });

      it('should add parameter', () => {
        service.getUserCollections(100, 20, 'createdat', `Title eq 'a'`).subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
          });
        expect(req.request.params.get('$count')).toEqual('true');
        expect(req.request.params.get('$top')).toEqual('100');
        expect(req.request.params.get('$skip')).toEqual('20');
        // expect(req.request.params.get('$orderby')).toEqual('CreatedAt asc');
        expect(req.request.params.get('$filter')).toEqual(`Title eq 'a' and User eq '${fakeData.userID1Sub}'`);
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 0,
          value: [],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getUserCollections().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toContain(msg);
          }
        });

        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getUserHabits', () => {
    let callurl = `${environment.apiurlRoot}/UserHabits`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      service.getUserHabits().subscribe({
        next: (val: {totalCount: number, items: UserHabit[]}) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: err => {
          expect(err).toBeFalsy();
        }
      });
    });

    describe('After user login', () => {      
      beforeEach(() => {
      });

      it('should return expected data', () => {
        service.getUserHabits().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl
            && requrl.params.has('$count');
          });
        expect(req.request.params.get('$count')).toEqual('true');
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [{
            ID: 1,
            Name: 'Coll 1'
          }],
        });
      });

      it('should add parameter', () => {
        service.getUserHabits(100, 20, 'name', 'asc', `Title eq 'a'`).subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toBeFalsy();
          }
        });

        // Service should have made one request to GET data from expected URL
        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
          });
        expect(req.request.params.get('$count')).toEqual('true');
        expect(req.request.params.get('$top')).toEqual('100');
        expect(req.request.params.get('$skip')).toEqual('20');
        expect(req.request.params.get('$orderby')).toEqual('Name asc');
        expect(req.request.params.get('$filter')).toEqual(`Title eq 'a'`);
    
        // Respond with the mock data
        req.flush({
          '@odata.count': 0,
          value: [],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getUserHabits().subscribe({
          next: val => {
            expect(val).toBeTruthy();
          },
          error: err => {
            expect(err).toContain(msg);
          }
        });

        const req: any = httpTestingController.expectOne((requrl: any) => {
          return requrl.method === 'GET'
            && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });
});
