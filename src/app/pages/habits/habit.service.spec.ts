import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, type TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom, of } from 'rxjs';

import { authInterceptor } from '../../services/auth.interceptor';
import type { Habit, HabitCreate, HabitUpdate } from './habit.models';
import { HabitApiError } from './habit.models';
import { HabitService } from './habit.service';

// Dev environment.apiUrl is https://localhost:7135 (see environments/environment.ts).
const BASE = 'https://localhost:7135/api/Habits';

const mockHabit: Habit = {
  id: 7,
  name: 'Morning run',
  description: null,
  cycle: 'weekly',
  startDate: '2026-09-01',
  endDate: null,
  state: 'active',
  hasPunches: false,
  createdAt: '2026-09-01T08:00:00Z',
  progress: {
    cycleFrom: '2026-09-14',
    cycleTo: '2026-09-20',
    rootCriterion: {
      criterionId: 1,
      name: 'Goal',
      isRoot: true,
      criterionType: 'condition',
      passed: false,
      propertyName: 'distance',
      aggregationMode: null,
      currentValue: 5,
      threshold: 30,
      successType: 'cumulative',
      // Cumulative root: no stored cycleTarget — the threshold IS the target.
      cycleTarget: null,
      currentDayValue: null,
      successfulDays: null,
      operator: null,
      operandIds: null,
    },
    criteria: [],
  },
};

describe('HabitService', () => {
  let service: HabitService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // The REAL interceptor chain (same wiring as app.config.ts), so these
        // specs prove the bearer token actually rides along on apiUrl + idServerUrl calls.
        provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: OidcSecurityService, useValue: { getAccessToken: () => of('test-bearer-token') } },
      ],
    });
    service = TestBed.inject(HabitService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('habit CRUD URLs', () => {
    it('GETs the list from /api/Habits', async () => {
      const result = firstValueFrom(service.getHabits());
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush([mockHabit]);
      expect(await result).toEqual([mockHabit]);
    });

    it('GETs a single habit by id', async () => {
      const result = firstValueFrom(service.getHabit(7));
      const req = http.expectOne(`${BASE}/7`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHabit);
      expect(await result).toEqual(mockHabit);
    });

    it('POSTs the create payload unchanged (name-based refs)', async () => {
      const payload: HabitCreate = {
        name: 'Morning run',
        description: null,
        cycle: 'weekly',
        startDate: '2026-09-01',
        endDate: null,
        items: [{ name: 'Morning run', order: 0, properties: [{ name: 'distance', propertyType: 'numeric', order: 0 }] }],
        criteria: [{ name: 'Goal', isRoot: true, criterionType: 'condition', propertyName: 'distance', threshold: 30, successType: 'cumulative' }],
      };
      const result = firstValueFrom(service.createHabit(payload));
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockHabit);
      expect(await result).toEqual(mockHabit);
    });

    it('PUTs updates to the habit', async () => {
      const body: HabitUpdate = { name: 'Renamed', description: null, cycle: 'weekly', startDate: '2026-09-01', endDate: null };
      const result = firstValueFrom(service.updateHabit(7, body));
      const req = http.expectOne(`${BASE}/7`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockHabit);
      expect(await result).toEqual(mockHabit);
    });

    it('POSTs deactivate to the Deactivate sub-route', async () => {
      const result = firstValueFrom(service.deactivateHabit(7));
      const req = http.expectOne(`${BASE}/7/Deactivate`);
      expect(req.request.method).toBe('POST');
      req.flush({ ...mockHabit, state: 'inactive' });
      expect((await result).state).toBe('inactive');
    });

    it('DELETEs the habit', async () => {
      const result = firstValueFrom(service.deleteHabit(7));
      const req = http.expectOne(`${BASE}/7`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await result;
    });
  });

  describe('history query parameters', () => {
    it('sends from/to when provided', async () => {
      const p = firstValueFrom(service.getHistory(7, '2026-09-01', '2026-09-07'));
      const req = http.expectOne(`${BASE}/7/History?from=2026-09-01&to=2026-09-07`);
      req.flush([]);
      expect(await p).toEqual([]);
    });

    it('omits parameters when not provided', async () => {
      const p = firstValueFrom(service.getHistory(7));
      const req = http.expectOne(`${BASE}/7/History`);
      req.flush([]);
      await p;
    });
  });

  describe('habit punch list URLs (calendar page)', () => {
    it('sends from/to when provided', async () => {
      const p = firstValueFrom(service.getHabitPunches(7, '2026-09-01', '2026-09-07'));
      const req = http.expectOne(`${BASE}/7/Punches?from=2026-09-01&to=2026-09-07`);
      req.flush([]);
      expect(await p).toEqual([]);
    });

    it('omits parameters when not provided', async () => {
      const p = firstValueFrom(service.getHabitPunches(7));
      const req = http.expectOne(`${BASE}/7/Punches`);
      req.flush([]);
      await p;
    });

    it('createPunch forwards an optional punchDate for back-fill', async () => {
      const p = firstValueFrom(
        service.createPunch(7, 3, { values: [{ propertyId: 5, numValue: 2 }], punchDate: '2026-09-10' })
      );
      const req = http.expectOne(`${BASE}/7/Items/3/Punches`);
      expect(req.request.body).toEqual({ values: [{ propertyId: 5, numValue: 2 }], punchDate: '2026-09-10' });
      req.flush({});
      await p;
    });
  });

  describe('shared gallery + share toggle URLs', () => {
    const SHARED = 'https://localhost:7135/api/SharedHabits';

    it('GETs the gallery from /api/SharedHabits', async () => {
      const p = firstValueFrom(service.getSharedHabits());
      const req = http.expectOne(SHARED);
      expect(req.request.method).toBe('GET');
      req.flush([{ habit: mockHabit, ownerName: 'Alice' }]);
      const result = await p;
      expect(result).toEqual([{ habit: mockHabit, ownerName: 'Alice' }]);
    });

    it('GETs a shared habit detail and its history with range params', async () => {
      const pDetail = firstValueFrom(service.getSharedHabit(7));
      const detailReq = http.expectOne(`${SHARED}/7`);
      detailReq.flush({ habit: mockHabit, ownerName: 'Alice', items: [], criteria: [] });
      expect((await pDetail).ownerName).toBe('Alice');

      const pHist = firstValueFrom(service.getSharedHistory(7, '2026-09-01', '2026-09-07'));
      const histReq = http.expectOne(`${SHARED}/7/History?from=2026-09-01&to=2026-09-07`);
      histReq.flush([]);
      await pHist;
    });

    it('routes the Shares CRUD to api/Habits/{id}/Shares', async () => {
      const grant = { id: 3, granteeUserId: 'u-2', granteeUserName: 'Bob', createdAt: '' };

      const pList = firstValueFrom(service.getShares(7));
      const listReq = http.expectOne(`${BASE}/7/Shares`);
      listReq.flush([grant]);
      expect(await pList).toEqual([grant]);

      const pAdd = firstValueFrom(service.addShare(7, 'u-2', 'Bob'));
      const addReq = http.expectOne(`${BASE}/7/Shares`);
      expect(addReq.request.method).toBe('POST');
      expect(addReq.request.body).toEqual({ granteeUserId: 'u-2', granteeUserName: 'Bob' });
      addReq.flush(grant);
      expect((await pAdd).id).toBe(3);

      const pDel = firstValueFrom(service.deleteShare(7, 3));
      const delReq = http.expectOne(`${BASE}/7/Shares/3`);
      expect(delReq.request.method).toBe('DELETE');
      delReq.flush(null);
      await pDel;
    });

    it('searchUsers hits ACIDSERVER (idServerUrl), not the learning API', async () => {
      const p = firstValueFrom(service.searchUsers('ali'));
      const req = http.expectOne('https://localhost:7228/api/users/search?q=ali');
      expect(req.request.method).toBe('GET');
      // C1 regression: the interceptor must cover idServerUrl too, or the
      // invite picker 401s and the search is dead.
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-bearer-token');
      req.flush([{ userId: 'u-1', userName: 'alice' }]);
      expect(await p).toEqual([{ userId: 'u-1', userName: 'alice' }]);
    });

    it('searchUsers sends the bearer token on learning API calls as well', async () => {
      const p = firstValueFrom(service.getHabits());
      const req = http.expectOne(BASE);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-bearer-token');
      req.flush([]);
      await p;
    });

    it('searchUsers skips the call for a blank query (emits empty)', async () => {
      const result = await firstValueFrom(service.searchUsers('   '));
      expect(result).toEqual([]);
      http.expectNone('https://localhost:7228/api/users/search');
    });

    it('searchUsers trims and truncates q to acidserver\'s 50-char limit', async () => {
      const long = '  ' + 'x'.repeat(80) + '  ';
      const p = firstValueFrom(service.searchUsers(long));
      const req = http.expectOne(`https://localhost:7228/api/users/search?q=${'x'.repeat(50)}`);
      req.flush([]);
      expect(await p).toEqual([]);
    });
  });

  describe('nested resource URLs', () => {
    it('routes items, properties, criteria and punches to the documented paths', async () => {
      const calls: { label: string; run: () => Promise<unknown>; url: string; method: string }[] = [
        { label: 'getItems', run: () => firstValueFrom(service.getItems(7)), url: `${BASE}/7/Items`, method: 'GET' },
        {
          label: 'addItem',
          run: () => firstValueFrom(service.addItem(7, { name: 'Item', order: 1, properties: [] })),
          url: `${BASE}/7/Items`,
          method: 'POST',
        },
        {
          label: 'updateItem',
          run: () => firstValueFrom(service.updateItem(7, 3, { name: 'Renamed', order: 0 })),
          url: `${BASE}/7/Items/3`,
          method: 'PUT',
        },
        { label: 'deleteItem', run: () => firstValueFrom(service.deleteItem(7, 3)), url: `${BASE}/7/Items/3`, method: 'DELETE' },
        {
          label: 'addProperty',
          run: () => firstValueFrom(service.addProperty(7, 3, { name: 'pages', propertyType: 'numeric', order: 0 })),
          url: `${BASE}/7/Items/3/Properties`,
          method: 'POST',
        },
        {
          label: 'updateProperty',
          run: () => firstValueFrom(service.updateProperty(7, 3, 5, { name: 'pages', order: 0 })),
          url: `${BASE}/7/Items/3/Properties/5`,
          method: 'PUT',
        },
        {
          label: 'deleteProperty',
          run: () => firstValueFrom(service.deleteProperty(7, 3, 5)),
          url: `${BASE}/7/Items/3/Properties/5`,
          method: 'DELETE',
        },
        { label: 'getCriteria', run: () => firstValueFrom(service.getCriteria(7)), url: `${BASE}/7/Criteria`, method: 'GET' },
        {
          label: 'addCriterion',
          run: () => firstValueFrom(service.addCriterion(7, { name: 'C', isRoot: false, criterionType: 'condition', propertyName: 'pages' })),
          url: `${BASE}/7/Criteria`,
          method: 'POST',
        },
        {
          label: 'updateCriterion',
          run: () => firstValueFrom(service.updateCriterion(7, 1, { name: 'C', isRoot: true })),
          url: `${BASE}/7/Criteria/1`,
          method: 'PUT',
        },
        { label: 'deleteCriterion', run: () => firstValueFrom(service.deleteCriterion(7, 1)), url: `${BASE}/7/Criteria/1`, method: 'DELETE' },
        {
          label: 'createPunch',
          run: () => firstValueFrom(service.createPunch(7, 3, { values: [{ propertyId: 5, numValue: 3 }] })),
          url: `${BASE}/7/Items/3/Punches`,
          method: 'POST',
        },
        {
          label: 'updatePunch',
          run: () => firstValueFrom(service.updatePunch(7, 3, 11, { values: [] })),
          url: `${BASE}/7/Items/3/Punches/11`,
          method: 'PUT',
        },
        { label: 'deletePunch', run: () => firstValueFrom(service.deletePunch(7, 3, 11)), url: `${BASE}/7/Items/3/Punches/11`, method: 'DELETE' },
      ];

      // URL/method assertions only — response bodies are opaque placeholders
      // (the typed consumers are covered by the CRUD specs above).
      for (const call of calls) {
        const p = call.run();
        const req = http.expectOne(call.url);
        expect(req.request.method, call.label).toBe(call.method);
        req.flush(call.label.endsWith('get') || call.label.startsWith('get') ? [] : null);
        await p;
      }
    });
  });

  describe('error normalization', () => {
    async function errorFrom(flushError: (req: TestRequest) => void): Promise<unknown> {
      const p = firstValueFrom(service.getHabits()).catch((e: unknown) => e);
      const req = http.expectOne(BASE);
      flushError(req);
      return p;
    }

    it('maps RFC7807 ProblemDetails extensions.code to HabitApiError', async () => {
      const err = (await errorFrom((req) =>
        req.flush({ type: 'https://...', title: 'Unprocessable Content', status: 422, code: 'outOfWindow', detail: 'outside window' }, { status: 422, statusText: 'Unprocessable Content' })
      )) as HabitApiError;
      expect(err).toBeInstanceOf(HabitApiError);
      expect(err.code).toBe('outOfWindow');
      expect(err.detail).toBe('outside window');
      expect(err.status).toBe(422);
    });

    it('falls back to httpError for failures without a code', async () => {
      const err = (await errorFrom((req) => req.flush('Server Error', { status: 500, statusText: 'Server Error' }))) as HabitApiError;
      expect(err).toBeInstanceOf(HabitApiError);
      expect(err.code).toBe('httpError');
      expect(err.status).toBe(500);
    });

    it('maps transport failures to networkError (status 0)', async () => {
      const p = firstValueFrom(service.getHabits()).catch((e: unknown) => e);
      http.expectOne(BASE).error(new ErrorEvent('network error'));
      const err = (await p) as HabitApiError;
      expect(err).toBeInstanceOf(HabitApiError);
      expect(err.code).toBe('networkError');
      expect(err.status).toBe(0);
    });

    it('keeps the raw detail for known codes (no message rewriting)', async () => {
      const p = firstValueFrom(service.deletePunch(7, 3, 11)).catch((e: unknown) => e);
      const req = http.expectOne(`${BASE}/7/Items/3/Punches/11`);
      req.flush({ code: 'notFound', detail: 'Punch 11 not found' }, { status: 404, statusText: 'Not Found' });
      const err = (await p) as HabitApiError;
      expect(err.code).toBe('notFound');
      expect(err.detail).toBe('Punch 11 not found');
    });
  });
});
