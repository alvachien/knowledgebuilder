import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import type { UserLoginHistory } from '../interfaces';

import { UserLoginHistoryService } from './user-login-history.service';

describe('UserLoginHistoryService', () => {
  let service: UserLoginHistoryService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/UserLoginHistories`;

  const dayRow = (loginDate: string, loginCount = 1): UserLoginHistory => ({
    loginDate,
    firstLoginAt: `${loginDate}T01:00:00Z`,
    lastLoginAt: `${loginDate}T08:30:00Z`,
    loginCount,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserLoginHistoryService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserLoginHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('recordLogin', () => {
    it('should POST to the login histories endpoint with an empty placeholder body', () => {
      const response = dayRow('2026-10-05');
      let result: UserLoginHistory | undefined;

      service.recordLogin().subscribe(value => (result = value));

      const req = httpMock.expectOne({ url: apiUrl, method: 'POST' });
      expect(req.request.body).toEqual({});
      req.flush(response);

      expect(result).toEqual(response);
    });
  });

  describe('getHistory', () => {
    it('should GET without from/to params when none are given (server default window)', () => {
      const rows = [dayRow('2026-10-05'), dayRow('2026-10-04')];
      let result: UserLoginHistory[] | undefined;

      service.getHistory().subscribe(value => (result = value));

      const req = httpMock.expectOne(
        req_ => req_.url === apiUrl && req_.method === 'GET' && req_.params.keys().length === 0,
      );
      req.flush(rows);

      expect(result).toEqual(rows);
    });

    it('should serialize explicit from/to params', () => {
      const rows = [dayRow('2026-09-20')];

      service.getHistory('2026-09-01', '2026-09-30').subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}?from=2026-09-01&to=2026-09-30`,
      );
      expect(req.request.params.get('from')).toBe('2026-09-01');
      expect(req.request.params.get('to')).toBe('2026-09-30');
      req.flush(rows);
    });

    it('should omit an undefined param but keep the other', () => {
      service.getHistory(undefined, '2026-09-30').subscribe();

      const req = httpMock.expectOne(`${apiUrl}?to=2026-09-30`);
      expect(req.request.params.keys()).toEqual(['to']);
      req.flush([]);
    });
  });
});
