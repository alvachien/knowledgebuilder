import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ODataService } from './odata.service';
import { environment } from 'src/environments/environment';
import {
  ExerciseItem,
  ExerciseItemType,
  InvitedUser,
  KnowledgeItem,
  KnowledgeItemCategory,
  UserCollection,
  UserHabit,
  UserHabitPoint,
  UserHabitRecord,
  UserHabitRecordView,
} from '../models';
import { FakeData } from 'src/testing';
import { AuthService } from './auth.service';
import { SafeAny } from '../common';

describe('ODataService', () => {
  const fakeData: FakeData = new FakeData();
  let service: ODataService;
  let httpTestingController: HttpTestingController;
  const userDetail = new InvitedUser();
  const authStub: Partial<AuthService> = {
    userDetail: userDetail,
    isAuthenticated: true,
  };

  beforeAll(() => {
    fakeData.buildCurrentUserDetail();
    fakeData.buildKnowledgeItems();

    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authStub }],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ODataService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMetadata', () => {
    const callurl = `${environment.apiurlRoot}/$metadata`;
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected metadata (called once)', () => {
      service.getMetadata().subscribe({
        next: (val) => {
          expect(val).toBeTruthy();
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });

      // Service should have made one request to GET data from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === callurl;
      });

      // Respond with the mock data
      req.flush('Metadata');
    });

    it('should return error in case error appear', () => {
      const msg = 'Deliberate 404';
      service.getMetadata().subscribe({
        next: (val) => {
          expect(val).toBeTruthy();
        },
        error: (err) => {
          expect(err.toString()).toContain(msg);
        },
      });

      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === callurl;
      });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected metadata (called multiple times)', () => {
      // First call
      service.getMetadata().subscribe({});

      // Service should have made one request to GET data from expected URL
      const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === callurl;
      });

      // Respond with the mock data
      req.flush('Metadata');
      httpTestingController.verify();

      // Second call
      service.getMetadata().subscribe({});
      let requests = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === callurl;
      });
      expect(requests.length).toEqual(0);

      // Third call
      service.getMetadata().subscribe({});
      requests = httpTestingController.match((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === callurl;
      });
      expect(requests.length).toEqual(0);

      // Forth call, with forceReload
      service.getMetadata(true).subscribe({});
      httpTestingController.expectOne((requrl: SafeAny) => {
        return requrl.method === 'GET' && requrl.url === callurl;
      });
      httpTestingController.verify();
    });
  });

  describe('getKnowledgeItems', () => {
    const callurl = `${environment.apiurlRoot}/KnowledgeItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getKnowledgeItems().subscribe({
        next: (val: { totalCount: number; items: KnowledgeItem[] }) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected items', () => {
        service.getKnowledgeItems().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl && requrl.params.has('$count');
        });
        expect(req.request.params.get('$count')).toEqual('true');

        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [
            {
              ID: 1,
              Title: 'Test1',
              Content: 'Test1',
            },
          ],
        });
      });

      it('should add parameter', () => {
        service.getKnowledgeItems(100, 20, 'createdat', 'asc', `Title eq 'a'`).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
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
        const msg = 'Error 404';
        service.getKnowledgeItems().subscribe({
          next: () => {
            fail('Shall not reach');
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('readKnowledgeItem', () => {
    const callurl = `${environment.apiurlRoot}/KnowledgeItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.readKnowledgeItem(1).subscribe({
        next: (val: KnowledgeItem) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
          //expect(err).toContain(service.expertModeFailMsg);
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected items', () => {
        service.readKnowledgeItem(1).subscribe({
          next: (val: KnowledgeItem) => {
            expect(val).toBeTruthy();
          },
          error: () => {
            fail('shall not access here');
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl + '(1)';
        });

        // respond with a 404 and the error message in the body
        req.flush({
          ID: 1,
        });
        const idx = service.bufferedKnowledgeItems.findIndex((val) => val.ID === 1);
        expect(idx).not.toEqual(-1);

        service.readKnowledgeItem(1).subscribe({
          next: (val: KnowledgeItem) => {
            expect(val).toBeTruthy();
          },
          error: () => {
            fail('Shall not reach here');
          },
        });
        httpTestingController.expectNone((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl + '(1)';
        });
      });

      it('should return error', () => {
        const msg = 'Error 404';
        service.readKnowledgeItem(1).subscribe({
          next: () => {
            fail('shall not reach here');
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl + '(1)';
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('createKnowledgeItem', () => {
    const callurl = `${environment.apiurlRoot}/KnowledgeItems`;
    let objtc: KnowledgeItem;

    beforeEach(() => {
      authStub.isAuthenticated = true;
      objtc = new KnowledgeItem();
      objtc.ID = 21;
      objtc.Title = 'test';
      objtc.Content = 'test';
      objtc.ItemCategory = KnowledgeItemCategory.Concept;
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.createKnowledgeItem(objtc).subscribe({
        next: (val: KnowledgeItem) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });
    });

    describe('After user login', () => {
      it('should return expected items', () => {
        service.createKnowledgeItem(objtc).subscribe({
          next: (val: KnowledgeItem) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'POST' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush({
          ID: 1,
        });
      });
      it('should return error', () => {
        const msg = 'Error 404';
        service.createKnowledgeItem(objtc).subscribe({
          next: () => {
            fail('shall not reach here');
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'POST' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getExerciseItems', () => {
    const callurl = `${environment.apiurlRoot}/ExerciseItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getExerciseItems().subscribe({
        next: (val: { totalCount: number; items: ExerciseItem[] }) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected items', () => {
        service.getExerciseItems().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl && requrl.params.has('$count');
        });
        expect(req.request.params.get('$count')).toEqual('true');

        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [
            {
              ID: 1,
              Content: 'test1',
            },
          ],
        });
      });

      it('should add parameter', () => {
        service.getExerciseItems(100, 20, 'createdat', 'asc', `Title eq 'a'`).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
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
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('readExerciseItem', () => {
    const callurl = `${environment.apiurlRoot}/ExerciseItems`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.readExerciseItem(1).subscribe({
        next: (val: ExerciseItem) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
          //expect(err).toContain(service.expertModeFailMsg);
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected items', () => {
        service.readExerciseItem(1).subscribe({
          next: (val: ExerciseItem) => {
            expect(val).toBeTruthy();
          },
          error: () => {
            fail('shall not reach here');
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl + '(1)';
        });

        // respond with a 404 and the error message in the body
        req.flush({
          ID: 1,
        });
        const idx = service.bufferedExerciseItems.findIndex((val) => val.ID === 1);
        expect(idx).not.toEqual(-1);

        service.readExerciseItem(1).subscribe({
          next: (val: ExerciseItem) => {
            expect(val).toBeTruthy();
          },
          error: () => {
            fail('shall not reach here');
          },
        });
        httpTestingController.expectNone((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl + '(1)';
        });
      });

      it('should return error', () => {
        const msg = 'Error 404';
        service.readExerciseItem(1).subscribe({
          next: () => {
            fail('shall not reach here');
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl + '(1)';
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('createExerciseItem', () => {
    const callurl = `${environment.apiurlRoot}/ExerciseItems`;
    let objtc: ExerciseItem;

    beforeEach(() => {
      authStub.isAuthenticated = true;
      objtc = new ExerciseItem();
      objtc.ID = 21;
      objtc.ItemType = ExerciseItemType.EssayQuestions;
      objtc.Content = 'test';
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.createExerciseItem(objtc).subscribe({
        next: (val: ExerciseItem) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });
    });

    describe('After user login', () => {
      it('should return expected items', () => {
        service.createExerciseItem(objtc).subscribe({
          next: (val: ExerciseItem) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'POST' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush({
          ID: 1,
        });
      });
      it('should return error', () => {
        const msg = 'Error 404';
        service.createExerciseItem(objtc).subscribe({
          next: () => {
            fail('shall not reach here');
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'POST' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getUserCollections', () => {
    const callurl = `${environment.apiurlRoot}/UserCollections`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getUserCollections().subscribe({
        next: (val: { totalCount: number; items: UserCollection[] }) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.getUserCollections().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl && requrl.params.has('$count');
        });
        expect(req.request.params.get('$count')).toEqual('true');

        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [
            {
              ID: 1,
              User: 'User1',
              Name: 'Coll 1',
            },
          ],
        });
      });

      it('should add parameter', () => {
        service.getUserCollections(100, 20, 'createdat', `Title eq 'a'`).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });
        expect(req.request.params.get('$count')).toEqual('true');
        expect(req.request.params.get('$top')).toEqual('100');
        expect(req.request.params.get('$skip')).toEqual('20');
        // expect(req.request.params.get('$orderby')).toEqual('CreatedAt asc');
        //expect(req.request.params.get('$filter')).toEqual(`Title eq 'a' and User eq '${fakeData.userID1Sub}'`);

        // Respond with the mock data
        req.flush({
          '@odata.count': 0,
          value: [],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getUserCollections().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getUserHabits', () => {
    const callurl = `${environment.apiurlRoot}/UserHabits`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getUserHabits().subscribe({
        next: (val: { totalCount: number; items: UserHabit[] }) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.getUserHabits().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl && requrl.params.has('$count');
        });
        expect(req.request.params.get('$count')).toEqual('true');

        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [
            {
              ID: 1,
              Name: 'Coll 1',
            },
          ],
        });
      });

      it('should add parameter', () => {
        service.getUserHabits(100, 20, 'name', 'asc', `Title eq 'a'`).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
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
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getUserHabitRecords', () => {
    const callurl = `${environment.apiurlRoot}/UserHabitRecords`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getUserHabitRecords().subscribe({
        next: (val: { totalCount: number; items: UserHabitRecord[] }) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.getUserHabitRecords().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl && requrl.params.has('$count');
        });
        expect(req.request.params.get('$count')).toEqual('true');

        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [
            {
              habitID: 1,
              comment: 'Coll 1',
            },
          ],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getUserHabitRecords().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getUserHabitRecordViews', () => {
    const callurl = `${environment.apiurlRoot}/UserHabitRecordViews`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getUserHabitRecordViews().subscribe({
        next: (val: { totalCount: number; items: UserHabitRecordView[] }) => {
          expect(val).toBeTruthy();
          expect(val.totalCount).toEqual(0);
          expect(val.items.length).toEqual(0);
        },
        error: (err) => {
          expect(err).toBeFalsy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.getUserHabitRecordViews().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl && requrl.params.has('$count');
        });
        expect(req.request.params.get('$count')).toEqual('true');

        // Respond with the mock data
        req.flush({
          '@odata.count': 1,
          value: [
            {
              habitID: 1,
              comment: 'Coll 1',
            },
          ],
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getUserHabitRecordViews().subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('createHabitPoint', () => {
    const callurl = `${environment.apiurlRoot}/UserHabitPoints`;
    const objtrtn = {
      ID: 122,
      TargetUser: 'Test',
      RecordDate: '2022-12-12',
      Point: 30,
      Comment: 'test'
    };
    const objModel = new UserHabitPoint();
    objModel.parseData(objtrtn);

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.createHabitPoint(objModel).subscribe({
        next: (val: SafeAny) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.createHabitPoint(objModel).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'POST' && requrl.url === callurl;
        });

        // Respond with the mock data
        req.flush(objtrtn);
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.createHabitPoint(objModel).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'POST' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('getHabitPoints', () => {
    const callurl = `${environment.apiurlRoot}/UserHabitPoints`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.getHabitPoints('').subscribe({
        next: (val: SafeAny) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.getHabitPoints('').subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
            expect(val.length).toEqual(1);
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // Respond with the mock data
        req.flush({
          value: [{
            ID: 1,
            Name: 'test'
          }]
        });
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.getHabitPoints('').subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'GET' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('deleteHabitPoint', () => {
    const callurl = `${environment.apiurlRoot}/UserHabitPoints(122)`;

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return error if no login', () => {
      authStub.isAuthenticated = false;
      service.deleteHabitPoint(122).subscribe({
        next: (val: SafeAny) => {
          expect(val).toBeFalsy();
        },
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });
    });

    describe('After user login', () => {
      beforeEach(() => {
        authStub.isAuthenticated = true;
      });

      it('should return expected data', () => {
        service.deleteHabitPoint(122).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err).toBeFalsy();
          },
        });

        // Service should have made one request to GET data from expected URL
        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'DELETE' && requrl.url === callurl;
        });

        // Respond with the mock data
        req.flush({});
      });

      it('should return error in case error appear', () => {
        const msg = 'Deliberate 404';
        service.deleteHabitPoint(122).subscribe({
          next: (val) => {
            expect(val).toBeTruthy();
          },
          error: (err) => {
            expect(err.toString()).toContain(msg);
          },
        });

        const req: SafeAny = httpTestingController.expectOne((requrl: SafeAny) => {
          return requrl.method === 'DELETE' && requrl.url === callurl;
        });

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found' });
      });
    });
  });
});
